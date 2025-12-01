import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

const CustomDatePicker = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <DatePicker   
      className="bg-cyan-50 rounded-lg border border-gray-300 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      selected={startDate} 
      onChange={(date) => setStartDate(date)} 
      dateFormat="dd/MM/yyyy"
    />
  );
};

export default CustomDatePicker;