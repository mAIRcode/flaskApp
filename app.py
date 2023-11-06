import enum
import logging

from flask import Flask, render_template, request, jsonify
from model.db import Item, Log, db


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crud_example.db'
db.init_app(app)


class StateType(enum.Enum):
    PREVIOUS = 1
    ESTIMATE = 2
    REPORTED = 3
    RECONCILED = 4
    FINAL = 5


class ApprovalType(enum.Enum):
    REJECTED = 1
    NO_STATE = 2
    APPROVED = 3


@app.route('/')
def index():
    return render_template('main.html')


@app.route('/items', methods=['GET', 'POST'])
def handle_items():
    print('called handle items')
    if request.method == 'GET':
        items = Item.query.all()
        item_list = [{'id': item.id,
                      'name': item.name,
                      'value': item.value,
                      'state': item.state,
                      'approval': item.approval,
                      'update_ts': item.update_ts,
                      'create_ts': item.create_ts,
                      } for item in items]
        return jsonify({'data': item_list})

    elif request.method == 'POST':
        data = request.get_json()
        logging.info(f'POST with data: {data}.')
        new_item = Item(name=data['name'])
        new_log = Log(name=data['name'], user='TestUser')
        db.session.bulk_save_objects([new_item, new_log])
        db.session.commit()
        print('Item added successfully')
        return jsonify({'message': 'Item added successfully'})


@app.route('/items/<int:item_id>', methods=['DELETE', 'PUT'])
def item_operations(item_id):
    item = Item.query.get(item_id)

    if not item:
        return jsonify({'message': 'Item not found'}, 404)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        print('Item deleted successfully')
        return jsonify({'message': 'Item deleted successfully'})

    if request.method == 'PUT':
        data = request.get_json()
        # Check if there are changes in the data
        if 'name' in data and data['name'] != item.name:
            new_log = Log(name=data['name'], user='TestUser', item_id=item_id)
            db.session.add(new_log)

            item.name = data['name']

            db.session.commit()
            return jsonify({'message': 'Item updated successfully'})

        # No changes, return a message indicating that
        return jsonify({'message': 'No changes to update'})


@app.route('/log/<int:item_id>', methods=['GET', 'POST'])
def log(item_id):
    print(f'requesting logtable for id {item_id}.')

    if request.method == 'GET':
        logs = Log.query.filter(Log.item_id == item_id).all()
        log_list = [{'id': log.id,
                     'name': log.name,
                     'user': log.user,
                     'value': log.user,
                     'state': log.state,
                     'approval': log.approval,
                     'update_ts': log.update_ts,
                     'create_ts': log.create_ts,
                     } for log in logs]
        return jsonify({'data': log_list})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
