export default () => {
    return (input) => {
        return (input) ? input.charAt(0).toUpperCase() + input.substr(1) : '';
    }
}
