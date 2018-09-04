export default () => {
    return (value, delimiter) => {
        if(value) return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
    };
}
