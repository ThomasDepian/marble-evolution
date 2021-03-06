/**
 * Simple interface describing the properties of a coordinate
 * used in the game.
 * 
 * @note Can directly be passed to the constructor of `Phaser.Math.Vector2`.
 */
export interface CoordinateConfiguration {
    /**
     * x value of the coordinate
     */
    x: number;
    /**
     * y value of the coordinate
     */
    y: number;
}

/**
 * Simple coordinate type used in the game.
 * 
 * @note Can be converted into an instance of `Phaser.Math.Vector2` or `Phaser.Geom.Point`.
 */
export class Coordinate implements CoordinateConfiguration {

    public x: number;
    public y: number;

    /**
     * 
     * @param x x coordinate.
     * @param y y coordinate.
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Creates a new coordinate based on a configuration.
     * 
     * @param coordinate The configuration based on which the coordinate gets created.
     * 
     * @returns Returns the created coordinate.
     */
    public static of(coordinate: CoordinateConfiguration): Coordinate {
        return new Coordinate(coordinate.x, coordinate.y);
    }

    /**
     * Convert `this` to `Phaser.Geom.Point`.
     */
    public toPoint(): Phaser.Geom.Point{
        return new Phaser.Geom.Point(this.x, this.y);
    }

    /**
     * Convert `this` to `Phaser.Math.Vector2`.
     */
    public toVector2(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this);
    }
}