import chalk from 'chalk';

const wrapFu = function (isErr) {
    let isError = isErr;
    return function (description = '', ...values) {
        let bgColor = 'bgBlack';
        if (isError) {
            bgColor = 'bgRedBright';
        }

        if (typeof description === 'object' && description !== null) {
            console.log(chalk[bgColor].whiteBright(description.toString()), ' OR ',
                chalk[bgColor].whiteBright(`${JSON.stringify(description)}`));
            return;
        }
        let arrVal, pr = ' ', sf = ' ';
        if (Array.isArray(values[0])) {
            arrVal = values[0];
            pr = '[\n ';
            sf = ' \n]';
        } else {
            arrVal = values;
        }

        if (values.length === 0) {
            console.log(chalk[bgColor].blueBright(`${description}`));
            return;
        }

        if (arrVal.length === 0) {
            console.log(chalk[bgColor].blueBright(`${description}: `), chalk[bgColor].yellowBright(' [] '));
            return;
        }

        console.group(chalk[bgColor].whiteBright(`${description}:`))
        arrVal.forEach((v, i) => console.log(
            chalk[bgColor].yellowBright((i == 0 ? pr : ' ') + `${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}` + (i == arrVal.length - 1 ? sf : ' '))));
        console.groupEnd();
    }

}

let log = wrapFu(false);
let error = wrapFu(true);

export const utils = {
    log,
    error
}


