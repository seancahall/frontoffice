export default () => {
    return (value) => {
        if(typeof value !== 'number' || /^\d+$/.test(value) === false) return value;

        var B = 1000000000;
        var M = 1000000;

        var resultString = parseInt(value);
        if (resultString >= M && resultString < B) {
            return Math.round(resultString / M * 100) / 100 + 'M';
        }
        if (resultString >= B) {
            return Math.round(resultString / B * 100) / 100 + 'B';
        }

        return resultString;
    };
}
