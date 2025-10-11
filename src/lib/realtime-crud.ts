import { getIO } from './socket';
import { prisma } from './prisma';

export class RealtimeCRUD {
  
  // User CRUD Operations
  static async createUser(data: any) {
    try {
      const user = await prisma.user.create({ data });
      
      // Emit to all admin users
      const io = getIO();
      io.to('admin-room').emit('user-created', {
        type: 'user-created',
        data: user,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ User created and broadcasted:', user.id);
      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, data: any) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      });
      
      const io = getIO();
      
      // Emit to the specific user
      io.to(`user-${id}`).emit('user-updated', {
        type: 'user-updated',
        data: user,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to admin users
      io.to('admin-room').emit('user-updated', {
        type: 'user-updated',
        data: user,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ User updated and broadcasted:', user.id);
      return user;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string) {
    try {
      const user = await prisma.user.delete({
        where: { id },
      });
      
      const io = getIO();
      
      // Emit to admin users
      io.to('admin-room').emit('user-deleted', {
        type: 'user-deleted',
        data: { id, name: user.name },
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ User deleted and broadcasted:', id);
      return user;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  // Application CRUD Operations
  static async createApplication(data: any) {
    try {
      const application = await prisma.application.create({
        data,
        include: {
          student: true,
          internship: {
            include: {
              company: true,
            },
          },
        },
      });
      
      const io = getIO();
      
      // Emit to admin users
      io.to('admin-room').emit('new-application', {
        type: 'application-created',
        data: application,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to the student
      io.to(`user-${application.studentId}`).emit('application-created', {
        type: 'application-created',
        data: application,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Application created and broadcasted:', application.id);
      return application;
    } catch (error) {
      console.error('❌ Error creating application:', error);
      throw error;
    }
  }

  static async updateApplication(id: string, data: any) {
    try {
      const application = await prisma.application.update({
        where: { id },
        data,
        include: {
          student: true,
          internship: {
            include: {
              company: true,
            },
          },
        },
      });
      
      const io = getIO();
      
      // Emit to the student
      io.to(`user-${application.studentId}`).emit('application-updated', {
        type: 'application-updated',
        data: application,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to admin users
      io.to('admin-room').emit('application-updated', {
        type: 'application-updated',
        data: application,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Application updated and broadcasted:', application.id);
      return application;
    } catch (error) {
      console.error('❌ Error updating application:', error);
      throw error;
    }
  }

  // Document CRUD Operations
  static async createDocument(data: any) {
    try {
      const document = await prisma.document.create({
        data,
        include: {
          student: true,
        },
      });
      
      const io = getIO();
      
      // Emit to the student
      io.to(`user-${document.studentId}`).emit('document-created', {
        type: 'document-created',
        data: document,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to admin users
      io.to('admin-room').emit('document-created', {
        type: 'document-created',
        data: document,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Document created and broadcasted:', document.id);
      return document;
    } catch (error) {
      console.error('❌ Error creating document:', error);
      throw error;
    }
  }

  static async updateDocument(id: string, data: any) {
    try {
      const document = await prisma.document.update({
        where: { id },
        data,
        include: {
          student: true,
        },
      });
      
      const io = getIO();
      
      // Emit to the student
      io.to(`user-${document.studentId}`).emit('document-updated', {
        type: 'document-updated',
        data: document,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to admin users
      io.to('admin-room').emit('document-updated', {
        type: 'document-updated',
        data: document,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Document updated and broadcasted:', document.id);
      return document;
    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  }

  // Company CRUD Operations - Updated to use Application model
  static async createCompany(data: any) {
    try {
      // Create a system application record for company registration
      const application = await prisma.application.create({
        data: {
          studentId: 'system',
          status: 'company_registered',
          dateApplied: new Date(),
          projectTopic: `Company Registration: ${data.name}`,
          companyName: data.name,
          companyRegNumber: data.regNumber,
          companyPhone: data.phone,
          addressNumber: data.addressNumber,
          provinceId: data.provinceId,
          districtId: data.districtId,
          subdistrictId: data.subdistrictId,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude
        }
      });
      
      const company = {
        id: `company_${data.name.toLowerCase().replace(/\s+/g, '_')}`,
        ...data
      };
      
      const io = getIO();
      io.to('admin-room').emit('company-created', {
        type: 'company-created',
        data: company,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Company created and broadcasted:', company.id);
      return company;
    } catch (error) {
      console.error('❌ Error creating company:', error);
      throw error;
    }
  }

  static async updateCompany(id: string, data: any) {
    try {
      // Update the application record that represents the company
      const application = await prisma.application.update({
        where: { id },
        data: {
          companyName: data.name,
          companyRegNumber: data.regNumber,
          companyPhone: data.phone,
          addressNumber: data.addressNumber,
          provinceId: data.provinceId,
          districtId: data.districtId,
          subdistrictId: data.subdistrictId,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude
        }
      });
      
      const company = {
        id: `company_${data.name.toLowerCase().replace(/\s+/g, '_')}`,
        ...data
      };
      
      const io = getIO();
      io.to('admin-room').emit('company-updated', {
        type: 'company-updated',
        data: company,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Company updated and broadcasted:', company.id);
      return company;
    } catch (error) {
      console.error('❌ Error updating company:', error);
      throw error;
    }
  }
}