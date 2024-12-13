
import _ from 'lodash';


export function encodeQueryData(formData: any) {
  formData = removeUndefinedData(formData);
  const ret: any[] = [];
  for (let d in formData)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(formData[d]));
  return ret.join('&');
}

function removeUndefinedData(query: any) {
  Object.keys(query).forEach(
    (key) => {
      _.isEmpty(typeof query[key] == 'number' ? String(query[key]) : query[key]) && delete query[key];
    }
  );
  return query;
}
