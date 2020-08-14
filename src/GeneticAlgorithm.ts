import { Configuration } from './Configuration';
import { MarbleIndividual } from './MarbleIndividual';
/**
 * File providing helper utilities for the genetic algorithm.
 */


/**
 * Counts the number of iterations. The first iteration gets the number 1.
 * @readonly
 */
export let iterationCount: number;

/**
 * List containing the individuals of the current iteration.
 */
let population: MarbleIndividual[];


/**
 * @param initialPopulation The intial population.
 */
export function initializeAlgorithm(initialPopulation: MarbleIndividual[] = []): void {
    population = initialPopulation;
    iterationCount = 0;
}

/**
 * Starts a new iteration.
 */
export function startIteration(): void {
    iterationCount++;
    population.forEach(individual => individual.startIndividual());
}

/**
 * Stops the current iteration.
 * 
 * @todo Extend docu once more is known
 */
export function stopIteration(): void {
    population.forEach(individual => individual.stop());
    iterationFinished();
}

/**
 * Checks whether all individuals are stopped or not.
 * 
 * @returns Returns _true_ if all individuals have stopped, else _false_.
 */
export function allStoped(): boolean {
    const stopped = population.map(inidividual => !inidividual.isMoving());
    return stopped.every(Boolean)
}

/**
 * Kills the entire population.
 * **Use with care**
 */
export function killAll(): void {
    population.forEach(individual => individual.destroy());
    population = [];
}


/**
 * Performs action needed to conclude an iteration.
 * 
 * Calls the fitness function for each individual and generates
 * based on the fitness values a new generation.
 * 
 * @see [[Configuration]]: Please refer to the configuration class for limitations and probabilities that may
 * apply.
 */
function iterationFinished(): void {
    const fitnesValues = population.map(i => i.fitness());
    const populationCount = population.length;

    const newPopulation: MarbleIndividual[] = [];
    for (let i = 0; i < populationCount; i++) {
        const father = randomSelect(fitnesValues);
        const mother = randomSelect(fitnesValues);

        const child = reproduce(father, mother);

        if (Math.random() < Configuration.MUTATION_PROBABILITY) {
            child.mutate();
        }

        newPopulation.push(child);
    }

    killAll();

    population = newPopulation;
}

/**
 * Performs the random select of an individual for the reproduction.
 * 
 * The random select uses the fitness function of each individual to
 * select among the population one of the _fittest_ individuals.
 * 
 * The individual gets chosen according to the _Fitness proportionate selection_
 * also known as _roulette wheel selection_ algorithm (See the 
 * [Wikipedia article](https://en.wikipedia.org/wiki/Fitness_proportionate_selection)
 * for further details).
 * 
 * That means, that the individual with the highest fitness has the highest probability
 * that it will be chosen. Nevertheless, also a 'non-fit-individual' has a, of course small,
 * chance that it will be selected for reproduction.
 * 
 * @param fitnesValues List containing the fitness values of all individuals of the population.
 *                     The first value of the fitness list is the fitness value of the first
 *                     individual in the population, the second from the second and so forth.
 * 
 * @returns The individual which is chosen for reproduction.
 */
function randomSelect(fitnesValues: number[]): MarbleIndividual {
    const population_size = population.length;

    const sumFitnesValues = fitnesValues.reduce((previous, current, i, a) => {
        return previous + current
    });
    
    const cutOffs = fitnesValues.map(_ => 0.0);
    let previous_probability = 0.0;

    // compute the cutoff values
    // the cutoff values are ascending real values in the range between [0, 1)
    // the difference (i.e. range) between two cutoff values
    // cutoff[j+1] - cutoff[j] for j in [0, population_size-2] or
    // 1 - cutoff[j] for j = population_size-1 is proportional
    // to the fitness value of the individual j.
    for (let i = 0; i < population_size; i++) {
        cutOffs[i] = previous_probability + (fitnesValues[i] / sumFitnesValues);
        previous_probability = cutOffs[i];
    }
    
    const selection = Math.random();

    // choose individual based on selection
    for (let i = 0; i < population_size; i++) {
        if (selection < cutOffs[i]) {
            return population[i];
        }
    }
}

/**
 * Creates a new individual (child) based on two other individuals (parents).
 * 
 * The genes ('DNA') are mixed according to some probability.
 * @see [[Configuration]]: Please refer to the configuration class for limitations and probabilities that may
 * 
 * @param father The father of the child.
 * @param mother The mother of the child.
 * 
 * @returns A new child.
 */
function reproduce(father: MarbleIndividual, mother: MarbleIndividual): MarbleIndividual {
    const fatherDNA = father.dna;
    const motherDNA = mother.dna;

    const childDNA = {
        'power': Math.random() < Configuration.FATHER_GENES_PROBABILITY ? fatherDNA.power : motherDNA.power,
        'angle': Math.random() < Configuration.FATHER_GENES_PROBABILITY ? fatherDNA.angle : motherDNA.angle
    }

    const child = new MarbleIndividual(
        father.world,
        father.scene,
        father.startPoint,
        father.textureName,
        father.diameter,
        father.goal,
        childDNA,
    );

    return child;
}