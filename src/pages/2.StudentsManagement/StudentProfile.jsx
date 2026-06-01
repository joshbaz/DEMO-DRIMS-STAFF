import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useGetStudentDetails } from "../../store/tanstackStore/services/queries";
import StudentProfileProgressPage from "./StudentProfileProgressPage";
import { Icon } from "@iconify-icon/react";
import { Loader2, ArrowLeft } from "lucide-react";

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState("progress");
  const navigate = useNavigate();
  const { id } = useParams();
  const containerRef = useRef(null);

  const { data: studentData, isLoading, error } = useGetStudentDetails(id);

  console.log("studentDATA", studentData)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [id, activeTab]);

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <span className="text-red-500">
            Error loading data: {error?.message}
          </span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            <span className="text-lg font-medium text-gray-900">
              Loading student data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-[#23388F] text-white rounded-lg gap-2 hover:bg-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <span className="text-lg font-medium text-gray-900">
              Student not found
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div ref={containerRef} className="min-h-full bg-gray-50">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]">
        <p className="text-sm font-[Inter-SemiBold]  text-gray-900">Supervisor Portal</p>
        <p className="text-sm font-[Inter-Medium]  text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-6">
        <h1 className="text-2xl font-[Inter-Medium]">
          Student Profile
        </h1>
        <span className="text-sm font-[Inter-Regular] text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div>

      {/* Progress and Settings Tabs */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-[10px] shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-[#23388F] text-white rounded-[6px] gap-2 hover:bg-blue-600"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <span className="text-lg font-[Inter-SemiBold] capitalize text-gray-900">
                {studentData?.student?.fullName}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("progress")}
                className={`inline-flex items-center px-4 py-2 rounded-[6px] text-sm font-[Inter-Medium] gap-2 text-semantic-text-primary border-2
                 ${activeTab === "progress" ? "border-[#23388F]" : "border-[#C4C5C6]"}`}
              >
                <Icon icon="material-symbols:browse-activity-sharp" width="22" height="22" className=" text-[#626263]" />
                Progress
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 mb-4">
        {activeTab === "progress" && <StudentProfileProgressPage studentData={studentData} />}

      </div>
    </div>
  )
}

export default StudentProfile