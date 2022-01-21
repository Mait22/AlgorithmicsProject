import random
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

class Individual(object):
    def __init__(self, chromosome, model, number):
        self.chromosome = chromosome
        self.model = model
        self.number = (number)
        self.fitness = self.cal_fitness()
 
    @classmethod
    def mutated_genes(self):

        
        g = random.uniform(0.0, 1.0)
        
        if g <= 0.5:
            return 0
        else:
            return 1
 
    @classmethod
    def create_gnome(self):
        #return [self.mutated_genes() for _ in range(784)]
        return [random.uniform(0.0, 1.0) > 0.5 for i in range(196)]
        
        
    def mate(self, par2):

        # chromosome for offspring
        child_chromosome = []
        for gp1, gp2 in zip(self.chromosome, par2.chromosome):   
 
            # random probability 
            prob = random.random()
 
            # if prob is less than 0.45, insert gene
            # from parent 1
            if prob < 0.45:
                child_chromosome.append(gp1)
 
            # if prob is between 0.45 and 0.90, insert
            # gene from parent 2
            elif prob < 0.90:
                child_chromosome.append(gp2)
 
            # otherwise insert random gene(mutate),
            # for maintaining diversity
            else:
                child_chromosome.append(self.mutated_genes())
 
        # create new Individual(offspring) using
        # generated chromosome for offspring
        return Individual(child_chromosome, self.model, self.number)
 
    
    ## Calculate fitness
    def cal_fitness(self):    
        
        out = np.empty((1, 14, 14, 1), dtype=np.float32)
    
        i = 0
        for r in range(14):
            for c in range(14):
                out[0,r,c,0] = self.chromosome[i]
                i += 1

        model = self.model

        #pred = model.predict_proba(out)
        pred = model.predict(out)
        
        return (1 - pred[0][self.number])*100