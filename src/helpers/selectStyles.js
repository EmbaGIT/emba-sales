export const selectStyles = {
    control: (provided) => ({
        ...provided,
        boxShadow: 0,
        fontSize: 14,
        '&:hover': {
            outline: 0,
            backgroundColor: '#fff',
            color: '#3f4254',
            borderColor: '#69b3ff',
        },
    }),
    option: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
    container: (provided) => ({
        ...provided,
        flex: 1,
    }),
    indicatorSeparator: () => null,
    dropdownIndicator: (provided) => ({
        ...provided,
        paddingRight: 10,
        padding: 0,
    }),
    input: (provided) => ({
        ...provided,
        margin: 0,
    }),
};