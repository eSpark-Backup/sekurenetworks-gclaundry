import React, {useState , useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function CustomAutocomplete(props) {
  const {value , label , formik, accessorName } = props;
  const [selectedItem , setSelectedItem] = useState(null)
  const [inputValue, setInputValue] = useState('');

  useEffect(()=>{
    const newSelectedItem = props.options.find((opt)=>opt.value === value);
    setInputValue(newSelectedItem ? newSelectedItem.label : '')
    setSelectedItem(newSelectedItem ? newSelectedItem : null)
  },[value]);

  return (
      <Autocomplete
        fullWidth
        value={selectedItem}
        onChange={(_,value)=>props.handleChange(value)}
        onInputChange={(_,value)=>setInputValue(value)}
        inputValue={inputValue}
        id="controllable-states-demo"
        options={props.options}
        disabled={props.disabled}
        getOptionLabel={(option)=>{
            return option.label
        }}
        getOptionKey={(option , index)=>{
            return `${option.label}-${index}`
        }}
        renderInput={(params) => {
            return <TextField {...params} label={label} value={value} error={
                formik.touched[accessorName] && Boolean(formik.errors[accessorName])
              }
              helperText={
                formik.touched[accessorName] && formik?.errors[accessorName]
              }/>
        }}
      />
  );
}