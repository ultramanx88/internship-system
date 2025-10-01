import * as XLSX from 'xlsx';
import path from 'path';

async function readFacultyData() {
  try {
    console.log('Reading faculty data from Excel...');
    
    const filePath = path.join(process.cwd(), 'document-templates', 'ข้อมูล คณะ สาขา.xlsx');
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    console.log('Sheet names:', workbook.SheetNames);
    
    // Read the main sheet
    const worksheet = workbook.Sheets['Sheet1'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('All data:');
    jsonData.forEach((row, rowIndex) => {
      if (Array.isArray(row) && row.some(cell => cell)) { // Skip empty rows
        console.log(`Row ${rowIndex + 1}:`, row);
      }
    });
    
    // Parse structured data
    console.log('\n=== Parsing structured data ===');
    
    const faculties: any[] = [];
    let currentFaculty: any = null;
    let currentDepartment: any = null;
    
    // Skip header rows and start from row 3 (index 2)
    for (let i = 2; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;
      
      const [faculty, department, curriculum, major, area] = row;
      
      // New faculty
      if (faculty && faculty.trim()) {
        currentFaculty = {
          name: faculty.trim(),
          departments: []
        };
        faculties.push(currentFaculty);
        currentDepartment = null;
      }
      
      // New department
      if (department && department.trim() && currentFaculty) {
        currentDepartment = {
          name: department.trim(),
          curriculums: []
        };
        currentFaculty.departments.push(currentDepartment);
      }
      
      // Add curriculum
      if (curriculum && curriculum.trim() && currentDepartment) {
        const curriculumData: any = {
          name: curriculum.trim()
        };
        
        if (major && major.trim()) {
          curriculumData.major = major.trim();
        }
        
        if (area && area.trim()) {
          curriculumData.area = area.trim();
        }
        
        currentDepartment.curriculums.push(curriculumData);
      }
    }
    
    console.log('\nParsed faculties:');
    console.log(JSON.stringify(faculties, null, 2));
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

readFacultyData();