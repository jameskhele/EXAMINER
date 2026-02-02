/**
 * Parses the content of a CSV file buffer into an array of objects.
 * Assumes the first row of the CSV is the header.
 * @param {Buffer} buffer The file buffer from the uploaded file.
 * @returns {Array<Object>} An array of objects representing the CSV rows.
 */
const parseCSV = (buffer) => {
  // Convert the file buffer to a string, trimming any whitespace.
  const content = buffer.toString('utf-8').trim();
  
  // Split the content into individual lines.
  const lines = content.split(/\r?\n/);
  
  // The first line is the header. We extract the column names.
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Process the remaining lines (the data rows).
  const data = lines.slice(1).map(line => {
    // A simple regex to handle comma-separated values, including those in quotes.
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    
    // Create an object for the current row.
    const rowObject = {};
    headers.forEach((header, index) => {
      // Assign the value to the corresponding header key.
      // We remove quotes from the values if they exist.
      rowObject[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
    });
    return rowObject;
  });

  return data;
};

module.exports = { parseCSV };

