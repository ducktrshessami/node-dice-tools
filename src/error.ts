class CustomError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class RollQueryError extends CustomError { }
export class RollResultParseError extends CustomError { }
