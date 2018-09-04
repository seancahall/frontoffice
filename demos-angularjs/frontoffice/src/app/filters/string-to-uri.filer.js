export default () => {
    return input => {
        if (input) {
            let a = input.split('//');

            if (a[1]) {
                a = a[1].replace(/^(www\.)/i, '');
            } else {
                a = input.replace(/^(www\.)/i, '');
            }

            return `//www.${a}`;
        }

        return input;
    }
}