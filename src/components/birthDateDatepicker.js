import getYear from "date-fns/getYear";
import getMonth from "date-fns/getYear";
import DatePicker from "react-datepicker";

const BirthDateDatepicker = (props) => {
    const range = (start, end) => {
        return new Array(end - start).fill().map((d, i) => i + start);
    };
    const years = range(1950, getYear(new Date()) + 1, 1);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return(
        <DatePicker
            onChangeRaw={(e) => e.preventDefault()}
            selected={props.selectedDate}
            disabled={props.isDisabled}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            renderCustomHeader={({
                                     date,
                                     changeYear,
                                     changeMonth,
                                     decreaseMonth,
                                     increaseMonth,
                                     prevMonthButtonDisabled,
                                     nextMonthButtonDisabled,
                                 }) => (
                <div
                    style={{
                        margin: 10,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                    </button>
                    <select
                        value={getYear(date)}
                        onChange={({target: {value}}) => changeYear(value)}
                    >
                        {years.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={months[getMonth(date)]}
                        onChange={({target: {value}}) =>
                            changeMonth(months.indexOf(value))
                        }>
                        {months.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        {">"}
                    </button>
                </div>
            )}
            onChange={(date) => props.onDateChange("birthdate", date)}
        />
    )
}

export default BirthDateDatepicker;