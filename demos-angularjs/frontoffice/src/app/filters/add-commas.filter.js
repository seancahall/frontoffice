export default () => {
    return (input) => {
        return input ? parseFloat(input.toString().replace(/[, ]+/g, '')).toLocaleString('en') : null;
    }
}
