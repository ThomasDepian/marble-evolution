import { Configuration } from './Configuration';
import { Goal } from './Goal';
import { Marble } from './Marble';
import * as Phaser from 'phaser';


/**
 * Class representing marble controlled by the genetic algorithm.
 * 
 * The 'DNA' of an individual consists of the values of the
 * [[power]] and the [[angle]] property and is described using the interface
 * [[MarbleDNA]].
 * 
 * This class relies heavily on the implementations of the Marble class.
 * See the [[Marble]] class for further information.
 * 
 * The genetic algorithm is part of the class GeneticAlgorithm.ts.
 * 
 * @see [[Configuration]]: Please refer to the configuration class for any limitations/settings which may apply.
 */
export class MarbleIndividual extends Marble {

    /**
     * The dna of the marble individual.
     * @readonly
     */
    public readonly dna: MarbleDNA;

    /**
     * The goal to which the individual should
     * try to find a way.
     * @readonly
     */
    public readonly goal: Goal;

    /**
     * The goal to which the individual should
     * try to find a way.
     * @readonly
     */
    public readonly scene: Phaser.Scene;

    /**
     * The startpoint of the individual.
     * 
     * @note Only needed for the reproduce function.
     * @readony
     */
    public readonly startPoint: Phaser.Geom.Point;

    /**
     * The name of the texture for the individual.
     * 
     * @note Only needed for the reproduce function.
     * @readonly
     */
    public readonly textureName: string;

    /**
     * The diameter of the individual.
     * 
     * @note Only needed for the reproduce function.
     * @readonly
     */
    public readonly diameter: number;

    constructor (
        world: Phaser.Physics.Matter.World,
        scene: Phaser.Scene,
        startPoint: Phaser.Geom.Point,
        textureName: string,
        diameter: number,
        goal: Goal,
        dna?: MarbleDNA){

        super(world, scene, startPoint, textureName, diameter); 
        this.scene = scene;
        this.startPoint = startPoint;
        this.textureName = textureName;
        this.diameter = diameter;
        this.goal = goal;

        if (dna === undefined) {
            const power = Math.random() * 25;
            const angle = Math.random() * Math.PI;

            this.dna = {
                'power': power,
                'angle': angle
            }
        }else {
            this.dna  = dna;
        }

        // Disable collions
        this.setCollisionGroup(-1);
        
    }

    /**
     * Starts the individual by calling the the start method
     * of the parent class.
     * 
     * @see Marble.start
     */
    public startIndividual(): void {
        this.start(this.dna.power, this.dna.angle);
    }

    /**
     * Computes the fitness function of the individual.
     * 
     * The fitness function is currently computed using the reciprocal value of the distance to the
     * goal squared and is a real value in the closed range [0, 1].
     * 
     * @returns The fitness value of the individual.
     */
    public fitness(): number {
        const distance = super.distanceTo(this.goal);

        return 1 / Math.pow(distance, 2);
    }


    /**
     * Mutates the individual.
     * 
     * A call of the mutation method **does not** guarantee
     * that a mutation will be performed.
     * 
     * Each property/characteristics of the 'DNA' will be mutated
     * with some probability and can alter in a given range.
     * 
     * @see [[Configuration]]: Please refer to the configuration class for the concrete probabilities.
     */
    public mutate(): void {
        if (Math.random() < Configuration.POWER_MUTATION_PROBABILITY) {
            let power = this.dna.power;

            const powerRange = Configuration.POWER_MUTATION_RANGE;
            power += Math.floor(Math.random() * (powerRange - -powerRange) ) + powerRange;

            power = Math.min(0, power);
            power = Math.max(25, power);

            this.dna.power = power;
        } 
        
        if (Math.random() < Configuration.ANGLE_MUTATION_PROBABILITY) {
            let angle = this.dna.angle;

            const angleRange = Configuration.ANGLE_MUTATION_RANGE;
            angle += Math.floor(Math.random() * (angleRange - -angleRange) ) + angleRange;

            angle = Math.min(0, angle);
            angle = Math.max(Math.PI, angle);

            this.dna.angle = angle;
        } 
    }
}



/**
 * Interface describing the DNA of an individual.
 */
export interface MarbleDNA {
    /**
     * The angle component of the DNA.
     */
    angle: number,

    /**
     * The power component of the DNA.
     */
    power: number
}