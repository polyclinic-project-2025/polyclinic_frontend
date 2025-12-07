import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({ selected, onChange, ...props }) => {
  return (
    <DatePicker   
      className="bg-cyan-50 rounded-lg border border-gray-300 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      selected={selected ? new Date(selected) : null}
      onChange={onChange} 
      dateFormat="dd/MM/yyyy"
      {...props}
    />
  );
};

export default CustomDatePicker;