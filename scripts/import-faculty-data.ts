import * as XLSX from 'xlsx';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importFacultyData() {
  try {
    console.log('Importing faculty data from Excel...');
    
    const filePath = path.join(process.cwd(), 'document-templates', 'ข้อมูล คณะ สาขา.xlsx');
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Sheet1'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Clean and structure the data
    const cleanData: any[] = [];
    
    // Process the first section (Thai data)
    for (let i = 2; i < 16; i++) { // Rows 3-16 contain the main data
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;
      
      const [faculty, department, curriculum, major, area] = row;
      
      if (faculty && faculty.trim() && faculty !== 'คณะ') {
        cleanData.push({
          faculty: faculty.trim(),
          department: department?.trim() || null,
          curriculum: curriculum?.trim() || null,
          major: major?.trim() || null,
          area: area?.trim() || null,
          section: 'thai'
        });
      } else if (department && department.trim() && department !== 'สาขา') {
        // Use the last faculty
        const lastFaculty = cleanData[cleanData.length - 1]?.faculty;
        if (lastFaculty) {
          cleanData.push({
            faculty: lastFaculty,
            department: department.trim(),
            curriculum: curriculum?.trim() || null,
            major: major?.trim() || null,
            area: area?.trim() || null,
            section: 'thai'
          });
        }
      } else if (curriculum && curriculum.trim() && curriculum !== 'หลักสูตร') {
        // Use the last faculty and department
        const lastItem = cleanData[cleanData.length - 1];
        if (lastItem) {
          cleanData.push({
            faculty: lastItem.faculty,
            department: lastItem.department,
            curriculum: curriculum.trim(),
            major: major?.trim() || null,
            area: area?.trim() || null,
            section: 'thai'
          });
        }
      }
    }
    
    // Process the second section (English data)
    for (let i = 17; i < jsonData.length; i++) { // Rows 18+ contain English data
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;
      
      const [faculty, department, curriculum, major] = row;
      
      if (faculty && faculty.trim() && faculty !== 'คณะ') {
        cleanData.push({
          faculty: faculty.trim(),
          department: department?.trim() || null,
          curriculum: curriculum?.trim() || null,
          major: major?.trim() || null,
          area: null,
          section: 'english'
        });
      } else if (department && department.trim() && department !== 'สาขา') {
        const lastFaculty = cleanData.filter(d => d.section === 'english').pop()?.faculty;
        if (lastFaculty) {
          cleanData.push({
            faculty: lastFaculty,
            department: department.trim(),
            curriculum: curriculum?.trim() || null,
            major: major?.trim() || null,
            area: null,
            section: 'english'
          });
        }
      } else if (curriculum && curriculum.trim() && curriculum !== 'หลักสูตร') {
        const lastItem = cleanData.filter(d => d.section === 'english').pop();
        if (lastItem) {
          cleanData.push({
            faculty: lastItem.faculty,
            department: lastItem.department,
            curriculum: curriculum.trim(),
            major: major?.trim() || null,
            area: null,
            section: 'english'
          });
        }
      }
    }
    
    console.log('Clean data:', JSON.stringify(cleanData, null, 2));
    
    // Group data by faculty
    const facultyMap = new Map();
    
    cleanData.forEach(item => {
      if (!item.faculty || item.faculty === 'คณะ') return;
      
      if (!facultyMap.has(item.faculty)) {
        facultyMap.set(item.faculty, {
          nameTh: item.faculty,
          departments: new Map()
        });
      }
      
      const faculty = facultyMap.get(item.faculty);
      
      if (item.department && item.department !== 'สาขา') {
        if (!faculty.departments.has(item.department)) {
          faculty.departments.set(item.department, {
            nameTh: item.department,
            curriculums: new Map()
          });
        }
        
        const department = faculty.departments.get(item.department);
        
        if (item.curriculum && item.curriculum !== 'หลักสูตร') {
          if (!department.curriculums.has(item.curriculum)) {
            department.curriculums.set(item.curriculum, {
              nameTh: item.curriculum,
              majors: []
            });
          }
          
          const curriculum = department.curriculums.get(item.curriculum);
          
          if (item.major && item.major !== 'วิชาเอก') {
            curriculum.majors.push({
              nameTh: item.major,
              area: item.area
            });
          }
        }
      }
    });
    
    // Import to database
    console.log('\nImporting to database...');
    
    for (const [facultyName, facultyData] of facultyMap) {
      console.log(`Creating faculty: ${facultyName}`);
      
      const faculty = await prisma.faculty.create({
        data: {
          nameTh: facultyData.nameTh,
          code: generateFacultyCode(facultyData.nameTh)
        }
      });
      
      for (const [departmentName, departmentData] of facultyData.departments) {
        console.log(`  Creating department: ${departmentName}`);
        
        const department = await prisma.department.create({
          data: {
            nameTh: departmentData.nameTh,
            code: generateDepartmentCode(departmentData.nameTh),
            facultyId: faculty.id
          }
        });
        
        for (const [curriculumName, curriculumData] of departmentData.curriculums) {
          console.log(`    Creating curriculum: ${curriculumName}`);
          
          const curriculum = await prisma.curriculum.create({
            data: {
              nameTh: curriculumData.nameTh,
              code: generateCurriculumCode(curriculumData.nameTh),
              degree: extractDegree(curriculumData.nameTh),
              departmentId: department.id
            }
          });
          
          for (const majorData of curriculumData.majors) {
            console.log(`      Creating major: ${majorData.nameTh}`);
            
            await prisma.major.create({
              data: {
                nameTh: majorData.nameTh,
                area: majorData.area,
                curriculumId: curriculum.id
              }
            });
          }
        }
      }
    }
    
    console.log('\nImport completed successfully!');
    
  } catch (error) {
    console.error('Error importing faculty data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateFacultyCode(name: string): string {
  // Simple code generation - take first letters
  const words = name.split(/\s+/);
  return words.map(word => word.charAt(0)).join('').toUpperCase();
}

function generateDepartmentCode(name: string): string {
  const words = name.split(/\s+/);
  return words.map(word => word.charAt(0)).join('').toUpperCase();
}

function generateCurriculumCode(name: string): string {
  // Extract existing code if present (e.g., "บธ.บ." from curriculum name)
  const match = name.match(/^([ก-๙a-zA-Z\.]+)/);
  return match ? match[1] : name.substring(0, 5);
}

function extractDegree(name: string): string {
  // Extract degree from curriculum name
  const degreeMatch = name.match(/(บธ\.บ\.|ศศ\.บ\.|วศ\.บ\.|B\.B\.A|B\.A\.|B\.Eng\.)/);
  return degreeMatch ? degreeMatch[1] : '';
}

importFacultyData();