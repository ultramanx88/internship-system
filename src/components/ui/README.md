# Reusable UI Components

ชุดคอมโพเนนต์ที่สามารถนำกลับมาใช้ใหม่ได้ (Reusable Components) สำหรับระบบจัดการสหกิจศึกษา

## 📋 DataTable

ตารางข้อมูลที่รวมฟีเจอร์ครบครัน: pagination, search, filter, sorting, และ bulk actions

### Features
- ✅ Pagination with customizable page sizes
- ✅ Search functionality with debounced input
- ✅ Multiple filters support
- ✅ Column sorting
- ✅ Row selection (single/multiple)
- ✅ Bulk actions (delete, export, etc.)
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design

### Usage
```tsx
import { DataTable } from '@/components/ui';

<DataTable
  data={users}
  columns={columns}
  totalCount={totalUsers}
  currentPage={currentPage}
  pageSize={pageSize}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  sortField={sortField}
  sortOrder={sortOrder}
  onSortChange={handleSort}
  filters={filters}
  filterValues={filterValues}
  onFilterChange={handleFilterChange}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  getRowId={(row) => row.id}
  onBulkDelete={handleBulkDelete}
  title="ผู้ใช้"
  description="จัดการข้อมูลผู้ใช้ในระบบ"
/>
```

## 🎭 FormDialog

Modal สำหรับฟอร์มต่างๆ พร้อมฟีเจอร์ validation และ loading states

### Features
- ✅ Form validation
- ✅ Loading states
- ✅ Customizable buttons
- ✅ Different sizes
- ✅ Confirmation dialogs
- ✅ Bulk action dialogs

### Usage
```tsx
import { FormDialog, ConfirmationDialog } from '@/components/ui';

// Basic form dialog
<FormDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="เพิ่มผู้ใช้"
  description="กรอกข้อมูลผู้ใช้ใหม่"
  onSubmit={handleSubmit}
  isLoading={isLoading}
>
  <FormField>...</FormField>
</FormDialog>

// Confirmation dialog
<ConfirmationDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="ยืนยันการลบ"
  description="คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?"
  onConfirm={handleDelete}
  isDestructive={true}
/>
```

## 🏷️ StatusBadge

แสดงสถานะต่างๆ ด้วยสีและไอคอนที่เหมาะสม

### Features
- ✅ 30+ predefined status types
- ✅ Customizable colors and icons
- ✅ Different sizes
- ✅ Specialized badges for common use cases

### Usage
```tsx
import { StatusBadge, WorkflowStatusBadge, UserStatusBadge } from '@/components/ui';

// Basic usage
<StatusBadge status="approved" />
<StatusBadge status="pending" label="รอดำเนินการ" />

// Specialized badges
<WorkflowStatusBadge status="in_progress" />
<UserStatusBadge status="online" />
<ApprovalStatusBadge status="approved" />
<PriorityBadge priority="high" />
<GenderBadge gender="male" />
<VisibilityBadge visibility="public" />
```

## ⚡ WorkflowActions

จัดการ workflow actions สำหรับระบบสหกิจศึกษา

### Features
- ✅ Role-based actions
- ✅ Status-based button states
- ✅ Confirmation dialogs
- ✅ Notes support
- ✅ Loading states
- ✅ Customizable UI

### Usage
```tsx
import { 
  WorkflowActions, 
  StaffWorkflowActions, 
  SupervisorWorkflowActions 
} from '@/components/ui';

// Generic workflow actions
<WorkflowActions
  applicationId={applicationId}
  currentStatus={status}
  userRole={role}
  availableActions={actions}
  onActionComplete={handleAction}
/>

// Role-specific actions
<StaffWorkflowActions
  applicationId={applicationId}
  currentStatus={status}
  userRole="staff"
  onActionComplete={handleAction}
/>
```

## 🎨 Status Types

### Workflow Statuses
- `pending` - รอดำเนินการ
- `received` - รับเอกสารแล้ว
- `under_review` - กำลังตรวจสอบ
- `approved` - อนุมัติแล้ว
- `rejected` - ปฏิเสธ
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก

### User Statuses
- `online` - ออนไลน์
- `offline` - ออฟไลน์
- `busy` - ไม่ว่าง
- `away` - ไม่อยู่

### Approval Statuses
- `approved` - อนุมัติ
- `rejected` - ปฏิเสธ
- `pending_approval` - รออนุมัติ
- `draft` - ร่าง
- `published` - เผยแพร่

### Priority Levels
- `high` - สูง
- `medium` - ปานกลาง
- `low` - ต่ำ
- `urgent` - ด่วน

## 🔧 Customization

### DataTable Customization
```tsx
// Custom column rendering
const columns: Column<User>[] = [
  {
    key: 'name',
    label: 'ชื่อ',
    sortable: true,
    render: (value, row) => (
      <div className="font-medium">{value}</div>
    )
  },
  {
    key: 'status',
    label: 'สถานะ',
    render: (value) => <StatusBadge status={value} />
  }
];

// Custom toolbar
<DataTable
  // ... other props
  renderToolbar={() => (
    <Button onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  )}
  renderActions={(row) => (
    <div className="flex gap-2">
      <Button size="sm" variant="outline">Edit</Button>
      <Button size="sm" variant="destructive">Delete</Button>
    </div>
  )}
/>
```

### StatusBadge Customization
```tsx
// Custom status
<StatusBadge
  status="custom_status"
  label="สถานะพิเศษ"
  className="bg-purple-100 text-purple-800"
  customIcon={<Star className="h-3 w-3" />}
/>
```

## 📱 Responsive Design

คอมโพเนนต์ทั้งหมดรองรับ responsive design:
- Mobile-first approach
- Flexible layouts
- Touch-friendly interactions
- Adaptive spacing and sizing

## ♿ Accessibility

- ARIA labels and descriptions
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

## 🚀 Performance

- Memoized callbacks
- Debounced search
- Virtual scrolling (for large datasets)
- Lazy loading
- Optimized re-renders

## 📋 Display Components

### InfoCard - แสดงข้อมูลรายละเอียด
คอมโพเนนต์สำหรับแสดงข้อมูลรายละเอียดในรูปแบบการ์ด

#### Features
- ✅ Multiple layout options (grid, list, inline)
- ✅ Customizable fields and metadata
- ✅ Status badges and icons
- ✅ Action buttons
- ✅ Loading states
- ✅ Specialized components (StudentInfoCard, CompanyInfoCard)

#### Usage
```tsx
import { InfoCard, StudentInfoCard, CompanyInfoCard } from '@/components/ui';

// Basic InfoCard
<InfoCard
  title="ข้อมูลผู้ใช้"
  fields={[
    { key: 'name', label: 'ชื่อ', value: 'John Doe' },
    { key: 'email', label: 'อีเมล', value: 'john@example.com' }
  ]}
  columns={2}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Specialized components
<StudentInfoCard student={studentData} onEdit={handleEdit} />
<CompanyInfoCard company={companyData} onView={handleView} />
```

### ApplicationCard - แสดงข้อมูลการสมัคร
คอมโพเนนต์สำหรับแสดงข้อมูลการสมัครฝึกงาน/สหกิจ

#### Features
- ✅ Multiple variants (default, compact, detailed)
- ✅ Status badges and progress indicators
- ✅ Selection support
- ✅ Action buttons (view, edit, approve, reject)
- ✅ Skills and metadata display
- ✅ List and Grid layouts

#### Usage
```tsx
import { ApplicationCard, ApplicationList, ApplicationGrid } from '@/components/ui';

// Single application card
<ApplicationCard
  application={applicationData}
  variant="detailed"
  onView={handleView}
  onApprove={handleApprove}
  onReject={handleReject}
/>

// Application list
<ApplicationList
  applications={applications}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  onView={handleView}
  variant="detailed"
/>

// Application grid
<ApplicationGrid
  applications={applications}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  columns={3}
/>
```

### DetailList - แสดงรายการข้อมูล
คอมโพเนนต์สำหรับแสดงรายการข้อมูลในรูปแบบ list

#### Features
- ✅ Multiple variants (default, compact, detailed)
- ✅ Selection support
- ✅ Action buttons
- ✅ Metadata and tags display
- ✅ Loading and empty states
- ✅ Custom item rendering

#### Usage
```tsx
import { DetailList, ApplicationDetailList } from '@/components/ui';

// Basic DetailList
<DetailList
  items={items}
  variant="detailed"
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  onView={handleView}
  onEdit={handleEdit}
/>

// Specialized ApplicationDetailList
<ApplicationDetailList
  applications={applications}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  onView={handleView}
  variant="detailed"
/>
```

### GridList - แสดงรายการแบบ Grid
คอมโพเนนต์สำหรับแสดงรายการข้อมูลในรูปแบบ grid

#### Features
- ✅ Responsive grid layout (1-6 columns)
- ✅ Multiple card variants
- ✅ Selection support
- ✅ Image and icon support
- ✅ Metadata and tags display
- ✅ Action buttons
- ✅ Specialized components (CompanyGridList, UserGridList)

#### Usage
```tsx
import { GridList, CompanyGridList, UserGridList } from '@/components/ui';

// Basic GridList
<GridList
  items={items}
  columns={3}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  onView={handleView}
  onEdit={handleEdit}
/>

// Specialized components
<CompanyGridList
  companies={companies}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  columns={4}
/>

<UserGridList
  users={users}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  columns={5}
/>
```

## 🎨 Layout Patterns

### Card-based Layouts
- **InfoCard**: สำหรับแสดงข้อมูลรายละเอียด
- **ApplicationCard**: สำหรับแสดงข้อมูลการสมัคร
- **GridList**: สำหรับแสดงรายการแบบ grid

### List-based Layouts
- **DetailList**: สำหรับแสดงรายการแบบ list
- **DataTable**: สำหรับแสดงข้อมูลแบบตาราง

### Specialized Components
- **StudentInfoCard**: สำหรับข้อมูลนักศึกษา
- **CompanyInfoCard**: สำหรับข้อมูลบริษัท
- **ApplicationList/Grid**: สำหรับรายการการสมัคร
- **CompanyGridList**: สำหรับรายการบริษัท
- **UserGridList**: สำหรับรายการผู้ใช้

## 🔧 Customization Examples

### Custom InfoCard Fields
```tsx
const fields: InfoField[] = [
  {
    key: 'name',
    label: 'ชื่อ',
    value: user.name,
    icon: <User className="h-4 w-4" />,
    copyable: true
  },
  {
    key: 'website',
    label: 'เว็บไซต์',
    value: company.website,
    link: company.website,
    icon: <ExternalLink className="h-4 w-4" />
  }
];
```

### Custom ApplicationCard Actions
```tsx
<ApplicationCard
  application={app}
  renderActions={() => (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleCustomAction}>
        Custom Action
      </Button>
    </div>
  )}
/>
```

### Custom GridList Item
```tsx
<GridList
  items={items}
  renderItem={(item) => (
    <CustomCard item={item} />
  )}
/>
```
