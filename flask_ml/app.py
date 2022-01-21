# compose_flask/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

import redis
from redis.commands.json.path import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras

import random 
from classes.individual import Individual


redis_cache = redis.Redis(host='redis_db', port=6379, decode_responses=True)

app = Flask(__name__)
CORS(app)


@app.route('/start', methods=['POST'])
def start_evolutionary_algorithm():

    data = request.get_json()

    max_iter = int(data['max_iter'])
    number = int(data['number'])

    redis_cache.flushall()

    try:
        model = keras.models.load_model("model_14_14.h5")
    except:
        return 'Error in loading pretrained model'

    generation = 1 
    population = []
 
    for _ in range(100):
                gnome = Individual.create_gnome()
                population.append(Individual(gnome, model, number))
 
    while not generation > max_iter:
 
        population = sorted(population, key = lambda x:x.fitness)
 

        if population[0].fitness <= 1:

                    ## Fetch data        
            out = np.empty((1, 14, 14, 1), dtype=np.float32)
            
            i = 0
            for r in range(14):
                for c in range(14):
                    out[0,r,c,0] = population[0].chromosome[i]
                    i += 1
            
            pixels = out.reshape((14, 14))

            pred=model.predict(out)
            pred_flat= [str(x) for x in pred[0]]

            it = {
            'number': data['number'],
            'iteration': generation,
            'preds': pred_flat,
            'res_array': str(pixels),
            'pre_emptive_final': 1
            }

            redis_cache.json().set('iteration:1', Path.rootPath(), it)

            break
 
        new_generation = []
 
        s = int((10*100)/100)
        new_generation.extend(population[:s])
 

        s = int((90*100)/100)
        for _ in range(s):
            parent1 = random.choice(population[:50])
            parent2 = random.choice(population[:50])
            child = parent1.mate(parent2)
            new_generation.append(child)
 
        population = new_generation

        out = np.empty((1, 14, 14, 1), dtype=np.float32)
        
        i = 0
        for r in range(14):
            for c in range(14):
                out[0,r,c,0] = population[0].chromosome[i]
                i += 1
        
        pixels = out.reshape((14, 14))

        pred=model.predict(out)
        pred_flat= [str(x) for x in pred[0]]

        it = {
        'number': data['number'],
        'iteration': generation,
        'preds': pred_flat,
        'res_array': str(pixels),
        'pre_emptive_final': 0
        }

        redis_cache.json().set('iteration:1', Path.rootPath(), it)

        generation += 1

    return make_response(jsonify(it), 200)


if __name__ == "__main__":
    app.run(debug=True)