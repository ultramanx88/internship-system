import { Layout } from "../../../component/layout";
import { PROTECTED_PATH } from "../../../constant/path.route";
import { Table } from "../../../component/table";
import { ReadMoreRounded, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useViewModel from "./viewModel";
import {
  DataStalenessIndicator,
  CompactDataStalenessIndicator,
} from "../../../component/information";
import AdvancedSearchFilter from "../../../component/search/AdvancedSearchFilter";
import FallbackUI from "../../../component/error/FallbackUI";
import { TableSkeleton } from "../../../component/error";

const VisitorVisits = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    displayData,
    filters,
    applyFilters,
    resetFilters,
    handleRefresh,
    lastUpdateTime,
  } = useViewModel();

  return (
    <Layout
      header={[
        {
          path: PROTECTED_PATH.VISITOR_VISITS,
          name: "รายงานผลการนิเทศ",
        },
      ]}
    >
      <div className="bg-white p-4 mt-4 rounded-lg">
        <h1 className="text-xl font-bold text-secondary-600">
          รายงานผลการนิเทศ
        </h1>

        {/* Advanced Search Filter */}
        <div className="my-4">
          <AdvancedSearchFilter
            filters={filters}
            onFiltersChange={applyFilters}
            onReset={resetFilters}
            loading={loading}
            validationErrors={error?.type === "VALIDATION_ERROR" ? [error.userMessage] : []}
            searchPlaceholder="ค้นหาชื่อ-สกุล, รหัสนักศึกษา, บริษัท..."
            positionOptions={[
              { value: 'Software Engineer', label: 'Software Engineer' },
              { value: 'Data Analyst', label: 'Data Analyst' },
              { value: 'UX/UI Designer', label: 'UX/UI Designer' }
            ]}
          />
        </div>

        {/* Data Staleness Indicator */}
        <div className="my-4">
          <DataStalenessIndicator
            stalenessInfo={{
              lastUpdateTime,
              isStale: !loading && !error,
              staleDuration: lastUpdateTime ? Date.now() - lastUpdateTime.getTime() : 0,
              failureCount: error ? 1 : 0,
              nextRefreshTime: null,
            }}
            isRefreshing={loading}
            onManualRefresh={handleRefresh}
          />
        </div>

        {/* Loading and Error States */}
        {loading && <TableSkeleton rows={5} />}
        {error && !loading && (
          <FallbackUI
            error={error}
            onRetry={handleRefresh}
          />
        )}

        {/* Data Table */}
        {!loading && !error && (
          <div className="w-full mt-10">
            <Table
              header={[
                "ชื่อ-นามสกุล",
                "รหัสนักศึกษา",
                "บริษัท",
                "สถานะการนัดหมาย",
                "จำนวนการนัดหมาย",
                "เข้าชม",
              ]}
              data={
                displayData.length > 0 ? (
                  displayData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-x border-text-200"
                    >
                      <td className="ps-5 py-3">{item.studentName}</td>
                      <td>{item.studentCode}</td>
                      <td>{item.companyName}</td>
                      <td>{item.appointmentStatus}</td>
                      <td>{item.appointmentCount}</td>
                      <td>
                        <button
                          className="text-primary-600"
                          onClick={() =>
                            navigate(
                              PROTECTED_PATH.VISITOR_VISITS_PERSON +
                                `?id=${item.id}`
                            )
                          }
                        >
                          <Visibility />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )
              }
            />
          </div>
        )}
      </div>
    </Layout>
  );
};
export default VisitorVisits;
