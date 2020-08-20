import { ConfigurationHandler } from './Configuration';
import { Goal } from './Goal';
import { Marble } from './Marble';
import * as Phaser from 'phaser';
import { v4 as uuidv4 } from 'uuid';


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
 * The genetic algorithm is described using several methods tagged with 'Genetic Algorithm'.
 * Please refer to [[initializeGeneticAlgorithm]] as a starting point.
 * 
 * @see [[Configuration]]: Please refer to the configuration class for any limitations/settings which may apply.
 */
export class MarbleIndividual extends Marble {

    /**
     * Unique identifier to identifiy the individuals.
     * 
     * This is a uuidv4 128-bit number. See
     * (this article) [https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)]
     * for more information.
     * 
     * @readonly
     */
    private readonly id: string;


    /**
     * The dna of the marble individual.
     * 
     * @readonly
     */
    private readonly dna: MarbleDNA;

    /**
     * The goal to which the individual should
     * try to find a way.
     * 
     * @readonly
     */
    private readonly goal: Goal;

    /**
     * The name of the texture of the individual.
     * 
     * @note This property is only relevant for reproduction.
     * 
     * @readonly
     */
    private readonly textureName: string;

    /**
     * The diameter of the individual.
     * 
     * @note This property is only relevant for reproduction.
     * 
     * @readonly
     */
    private readonly diameter: number;


    
    /**
     * 
     * @param world       The world to which the individual belongs.
     * @param scene       The scene to which the individual belongs.
     * @param startPoint  Start point of the individual.
     * @param textureName The name of the texture. **Note**: Must be loaded _before_ the call.
     * @param diameter    Diameter of the individual. **Note**: Must be chosen such that the individual will not flow outside the screen.
     * @param goal        The goal to which the individual is reaching.
     * @param dna         The DNA of the individual. If not present, a random DNA will be generated.
     */
    constructor (
        world:       Phaser.Physics.Matter.World,
        scene:       Phaser.Scene,
        startPoint:  Phaser.Geom.Point,
        textureName: string,
        diameter:    number,
        goal:        Goal,
        dna?:        MarbleDNA
    ){
        super(world, scene, startPoint, textureName, diameter);
        this.goal        = goal;
        this.textureName = textureName;
        this.diameter    = diameter;

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

        // Disable collions within the same group (i.e. under individuals)
        this.setCollisionGroup(-1);
        this.id = uuidv4();
    }

    /**
     * Starts the individual by calling the the start method
     * of the parent class.
     * 
     * @see [[Marble.start]] for further details.
     */
    public startIndividual(): void {
        this.start(this.dna.power, this.dna.angle);
    }

    /**
     * Computes the distance to the goal.
     * 
     * @see [[Marble.distanceTo]] for further details.
     * 
     * @returns Returns the distance to the goal.
     */
    public distanceToGoal(): number {
        return this.distanceTo(this.goal);
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
     * Creates a new individual (child) based on the current individual (acting as father)
     * and an other individual (acting as mother).
     * 
     * The genes ('DNA') are mixed according to some probability.
     * @see [[Configuration]]: Please refer to the configuration class for limitations and probabilities that may apply.
     * 
     * @param mother The mother of the child.
     * 
     * @returns A new child.
     */
    public reproduceWith(mother: MarbleIndividual): MarbleIndividual {
        const fatherDNA = this.dna;
        const motherDNA = mother.dna;

        const childDNA = {
            'power': Math.random() < ConfigurationHandler.getGeneticAlgorithm().fatherGenesProbability.power ? fatherDNA.power : motherDNA.power,
            'angle': Math.random() < ConfigurationHandler.getGeneticAlgorithm().fatherGenesProbability.angle ? fatherDNA.angle : motherDNA.angle
        }

        const child = new MarbleIndividual(
            this.world,
            this.scene,
            this.startPosition,
            this.textureName,
            this.diameter,
            this.goal,
            childDNA,
        );

        return child;
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
     * @see [[Configuration]]: Please refer to the configuration class for the concrete probabilities and ranges
     */
    public mutate(): void {
        /**
         * Helper function returning a random number in the range [lowerBound, upperBound], both included.
         */
        const randomNumber = function(lowerBound: number = 0, upperBound: number = 1): number {
            return Math.floor(Math.random() * (upperBound - lowerBound + 1) ) + lowerBound;
        }


        if (Math.random() < ConfigurationHandler.getGeneticAlgorithm().mutationProbability.power) {
            let power = this.dna.power;

            const powerRange = ConfigurationHandler.getGeneticAlgorithm().mutationRange.power;
            power += randomNumber(powerRange.lowerBound, powerRange.upperBound);            

            power = Math.max(0, power);
            power = Math.min(25, power);

            this.dna.power = power;
        } 
        
        if (Math.random() < ConfigurationHandler.getGeneticAlgorithm().mutationProbability.angle) {
            let angle = this.dna.angle;

            const angleRange = ConfigurationHandler.getGeneticAlgorithm().mutationRange.angle;
            angle += randomNumber(angleRange.lowerBound, angleRange.upperBound);

            angle = Math.max(0, angle);
            angle = Math.min(Math.PI, angle);

            this.dna.angle = angle;
        } 
    }

    /**
     * Returns a string representation of an object.
     * 
     * @returns Returns the string representation.
     */
    public toString(): string {
        return this.id + ': DNA: {power:' + this.dna.power + ', angle: ' + this.dna.angle + '} Distance to goal: ' + this.distanceTo(this.goal);
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