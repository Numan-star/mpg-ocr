"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Link from "next/link";

import { IoIosArrowForward } from "react-icons/io";
import { IoIosInformationCircle } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { GiShare } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import Swal from 'sweetalert2';
import { createPortal } from "react-dom";
// import ReactDOM from "react-dom";
// import { query } from "express";

type FinalStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type ReviewStatus = "unConfirmed" | "confirmed" | "denied" | "deleted";
type RecognitionStatus = "new" | "inProgress" | "valid" | "partiallyValid" | "failure" | "sent";
type BreakdownReason = "none" | "damaged" | "shortage" | "overage" | "refused";

interface Job {
  _id: string;
  blNumber: string;
  jobName: string;
  carrier: string;
  podDate: string;
  podSignature: string;
  totalQty: number;
  delivered: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  sealIntact: string;
  noOfPages: number;
  finalStatus: FinalStatus;
  reviewStatus: ReviewStatus;
  recognitionStatus: RecognitionStatus;
  breakdownReason: BreakdownReason;
  reviewedBy: string;
  cargoDescription: string;
  receiverSignature: string;
}



const MasterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [isFilterDropDownOpen, setIsFilterDropDownOpen] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [master, setMaster] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [finalStatusFilter, setFinalStatusFilter] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("");
  const [reasonStatusFilter, setReasonStatusFilter] = useState("");
  const [reviewByStatusFilter, setReviewByStatusFilter] = useState("");
  const [podDateFilter, setPodDateFilter] = useState("");
  const [podDateSignatureFilter, setPodDateSignatureFilter] = useState("");
  const [jobNameFilter, setJobNameFilter] = useState("");
  const [bolNumberFilter, setBolNumberFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownStates, setDropdownStates] = useState<string | null>(null);
  const [dropdownStatesFirst, setDropdownStatesFirst] = useState<string | null>(null);
  const [dropdownStatesSecond, setDropdownStatesSecond] = useState<string | null>(null);
  const [dropdownStatesThird, setDropdownStatesThird] = useState<string | null>(null);

  const parentRefFinal = React.useRef<Record<string, HTMLDivElement | null>>({});
  const parentRefReview = React.useRef<Record<string, HTMLDivElement | null>>({});
  const parentRefRecognition = React.useRef<Record<string, HTMLDivElement | null>>({});
  const parentRefBreakdown = React.useRef<Record<string, HTMLDivElement | null>>({});


  const finalStatusStyles: Record<FinalStatus, string> = {
    new: "bg-blue-100 text-blue-600",
    inProgress: "bg-yellow-100 text-yellow-600",
    valid: "bg-green-100 text-green-600",
    partiallyValid: "bg-[#faf1be] text-[#AF9918]",
    failure: "bg-red-100 text-red-600",
    sent: "bg-green-100 text-green-600",
  };

  const reviewStatusStyles: Record<ReviewStatus, string> = {
    unConfirmed: "bg-yellow-100 text-yellow-600",
    confirmed: "bg-green-100 text-green-600",
    denied: "bg-[#faf1be] text-[#AF9918]",
    deleted: "bg-red-100 text-red-600",
  };

  const recognitionStatusStyles: Record<RecognitionStatus, string> = {
    new: "bg-blue-100 text-blue-600",
    inProgress: "bg-yellow-100 text-yellow-600",
    valid: "bg-green-100 text-green-600",
    partiallyValid: "bg-[#faf1be] text-[#AF9918]",
    failure: "bg-red-100 text-red-600",
    sent: "bg-green-100 text-green-600",
  };

  const breakdownReasonStyles: Record<BreakdownReason, string> = {
    none: "bg-blue-100 text-blue-600",
    damaged: "bg-yellow-100 text-yellow-600",
    shortage: "bg-green-100 text-green-600",
    overage: "bg-[#faf1be] text-[#AF9918]",
    refused: "bg-red-100 text-red-600",
  };


  const toggleDropdown = (id: string) => {
    setDropdownStates((prev) => (prev === id ? null : id));
  };

  const toggleDropdownFirst = (id: string) => {
    setDropdownStatesFirst(dropdownStatesFirst === id ? null : id);
  };

  const toggleDropdownSecond = (id: string) => {
    setDropdownStatesSecond(dropdownStatesSecond === id ? null : id);
  };

  const toggleDropdownThird = (id: string) => {
    setDropdownStatesThird(dropdownStatesThird === id ? null : id);
  };


  const finalOptions = [
    { status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
  ];

  const reviewOptions = [
    { status: "unConfirmed", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "confirmed", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "deleted", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "denied", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
  ];

  const recognitionOptions = [
    { status: "new", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "inProgress", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "valid", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "partiallyValid", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "failure", color: "text-red-600", bgColor: "bg-red-100" },
    { status: "sent", color: "text-green-600", bgColor: "bg-green-100" },
  ];

  const breakdownOptions = [
    { status: "none", color: "text-blue-600", bgColor: "bg-blue-100" },
    { status: "damaged", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { status: "shortage", color: "text-green-600", bgColor: "bg-green-100" },
    { status: "overage", color: "text-[#AF9918]", bgColor: "bg-[#faf1be]" },
    { status: "refused", color: "text-red-600", bgColor: "bg-red-100" },
  ];

  const Dropdown: React.FC<{ job: Job }> = ({ job }) => {
    if (dropdownStates !== job._id) return null;

    const rect = parentRefFinal.current[job._id]?.getBoundingClientRect();

    return createPortal(
      <ul
        className="absolute bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out"
        style={{
          top: rect ? `${rect.bottom + window.scrollY}px` : "0", // Fallback to 0 if rect is undefined
          left: rect ? `${rect.left}px` : "0", // Fallback to 0 if rect is undefined
          zIndex: 50,
        }}
      >
        {finalOptions.map(({ status, color, bgColor }) => (
          <li
            key={status}
            className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.finalStatus === status ? `${color} ${bgColor}` : color
              }`}
            onClick={() => {
              updateStatus(job._id, "finalStatus", status);
              setDropdownStates(null);
            }}
          >
            {status}
          </li>
        ))}
      </ul>,
      document.body
    );
  };

  const DropdownReview: React.FC<{ job: Job }> = ({ job }) => {
    if (dropdownStatesFirst !== job._id) return null;

    const rect = parentRefReview.current[job._id]?.getBoundingClientRect();

    return createPortal(
      <ul
        className="absolute bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out"
        style={{
          top: rect ? `${rect.bottom + window.scrollY}px` : "0",
          left: rect ? `${rect.left}px` : "0",
          zIndex: 50,
        }}
      >
        {reviewOptions.map(({ status, color, bgColor }) => (
          <li
            key={status}
            className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.reviewStatus === status ? `${color} ${bgColor}` : color
              }`}
            onClick={() => {
              updateStatus(job._id, "reviewStatus", status);
              setDropdownStatesFirst(null);
            }}
          >
            {status}
          </li>
        ))}
      </ul>,
      document.body
    );
  };

  const DropdownRecognition: React.FC<{ job: Job }> = ({ job }) => {
    if (dropdownStatesSecond !== job._id) return null;

    const rect = parentRefRecognition.current[job._id]?.getBoundingClientRect();

    return createPortal(
      <ul
        className="absolute bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out"
        style={{
          top: rect ? `${rect.bottom + window.scrollY}px` : "0", // Fallback to 0 if rect is undefined
          left: rect ? `${rect.left}px` : "0", // Fallback to 0 if rect is undefined
          zIndex: 50,
        }}
      >
        {recognitionOptions.map(({ status, color, bgColor }) => (
          <li
            key={status}
            className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.recognitionStatus === status ? `${color} ${bgColor}` : color
              }`}
            onClick={() => {
              updateStatus(job._id, "recognitionStatus", status);
              setDropdownStatesSecond(null);
            }}
          >
            {status}
          </li>
        ))}
      </ul>,
      document.body
    );
  };

  const DropdownBreakdown: React.FC<{ job: Job }> = ({ job }) => {
    if (dropdownStatesThird !== job._id) return null;

    const rect = parentRefBreakdown.current[job._id]?.getBoundingClientRect();

    return createPortal(
      <ul
        className="absolute bg-white border rounded-md shadow-lg w-32 transition-all duration-300 ease-in-out"
        style={{
          top: rect ? `${rect.bottom + window.scrollY}px` : "0", // Fallback to 0 if rect is undefined
          left: rect ? `${rect.left}px` : "0", // Fallback to 0 if rect is undefined
          zIndex: 50,
        }}
      >
        {breakdownOptions.map(({ status, color, bgColor }) => (
          <li
            key={status}
            className={`cursor-pointer px-3 py-1 hover:bg-blue-100 hover:text-black ${job.breakdownReason === status ? `${color} ${bgColor}` : color
              }`}
            onClick={() => {
              updateStatus(job._id, "breakdownReason", status);
              setDropdownStatesThird(null);
            }}
          >
            {status}
          </li>
        ))}
      </ul>,
      document.body
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("prev") === "") {
        setFinalStatusFilter(sessionStorage.getItem("finalStatusFilter") || "");
        setReviewStatusFilter(sessionStorage.getItem("reviewStatusFilter") || "");
        setReasonStatusFilter(sessionStorage.getItem("reasonStatusFilter") || "");
        setReviewByStatusFilter(sessionStorage.getItem("reviewByStatusFilter") || "");
        setPodDateFilter(sessionStorage.getItem("podDateFilter") || "");
        setPodDateSignatureFilter(sessionStorage.getItem("podDateSignatureFilter") || "");
        setJobNameFilter(sessionStorage.getItem("jobNameFilter") || "");
        setBolNumberFilter(sessionStorage.getItem("bolNumberFilter") || "");
        setIsLoading(false);
      }
      else {
        sessionStorage.setItem("finalStatusFilter", "");
        sessionStorage.setItem("reviewStatusFilter", "");
        sessionStorage.setItem("reasonStatusFilter", "");
        sessionStorage.setItem("reviewByStatusFilter", "");
        sessionStorage.setItem("podDateFilter", "");
        sessionStorage.setItem("podDateSignatureFilter", "");
        sessionStorage.setItem("jobNameFilter", "");
        sessionStorage.setItem("bolNumberFilter", "");
        setFinalStatusFilter("");
        setReviewStatusFilter("");
        setReasonStatusFilter("");
        setReviewByStatusFilter("");
        setPodDateFilter("");
        setPodDateSignatureFilter("");
        setJobNameFilter("");
        setBolNumberFilter("");
        setIsLoading(false);
      }
    }

  }, []);



  useEffect(() => {
    if (!isLoading && currentPage) {
      console.log(finalStatusFilter);
      fetchJobs();
    }
  }, [isLoading, currentPage])


  const router = useRouter();

  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };



  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }


    const decodeJwt = (token: string) => {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    };

    const decodedToken = decodeJwt(token);
    const currentTime = Date.now() / 1000;

    setUserRole(decodedToken.role);

    if (userRole === "admin") {
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/admin-login");
        return;
      }
    } else {
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router, userRole]);



  const handleRouteChange = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("finalStatusFilter", finalStatusFilter);
      sessionStorage.setItem("reviewStatusFilter", reviewStatusFilter);
      sessionStorage.setItem("reasonStatusFilter", reasonStatusFilter);
      sessionStorage.setItem("reviewByStatusFilter", reviewByStatusFilter);
      sessionStorage.setItem("podDateFilter", podDateFilter);
      sessionStorage.setItem("podDateSignatureFilter", podDateSignatureFilter);
      sessionStorage.setItem("jobNameFilter", jobNameFilter);
      sessionStorage.setItem("bolNumberFilter", bolNumberFilter);
    }

  };


  const handleRowSelection = (id: string) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === master.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(master.map((job) => job._id));
    }
  };

  // const isAllSelected = selectedRows.length === master.length;
  const isAllSelected = selectedRows.length === master.length && master.length > 0;

  const updateStatus = async (id: string, field: string, value: string): Promise<void> => {
    try {
      const res = await fetch(`/api/process-data/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });

      if (res.ok) {
        setMaster((prevJobs) =>
          prevJobs.map((job) =>
            job._id === id ? { ...job, [field]: value } : job
          )
        );
      } else {
        const errorData = await res.json();
        console.error(
          `Failed to update status: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  // useEffect(() => {
  //   const jobName = localStorage.getItem('jobName') || ''; 
  //   setJobNameFilter(jobName);
  // }, []);



  const handleDelete = async () => {
    Swal.fire({
      title: 'Delete Files',
      text: 'Are you sure you want to delete these files?',
      icon: 'warning',
      iconColor: '#005B97',
      showCancelButton: true,
      confirmButtonColor: '#005B97',
      cancelButtonColor: '#E0E0E0',
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/api/process-data/delete-rows', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedRows }),
          });

          const result = await response.json();

          if (response.ok) {
            const isLastPage = master.length === selectedRows.length && currentPage > 1;
            if (isLastPage) {
              setCurrentPage((prevPage) => prevPage - 1);
            }

            await fetchJobs();
            setTotalJobs(totalJobs - selectedRows.length);
            setSelectedRows([]);
            Swal.fire({
              title: 'Deleted!',
              text: 'Your files have been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: result.error || 'Failed to delete files.',
              icon: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting files:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete files due to a network or server error.',
            icon: 'error',
          });
        }
      }
    });
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingTable(true);
      const queryParams = new URLSearchParams();
      console.log(currentPage);
      queryParams.set("page", currentPage.toString());
      if (bolNumberFilter) queryParams.set("bolNumber", bolNumberFilter.trim());
      if (finalStatusFilter) queryParams.set("recognitionStatus", finalStatusFilter);
      if (reviewStatusFilter) queryParams.set("reviewStatus", reviewStatusFilter);
      if (reasonStatusFilter) queryParams.set("breakdownReason", reasonStatusFilter);
      if (reviewByStatusFilter) queryParams.set("reviewByStatus", reviewByStatusFilter);
      if (podDateFilter) queryParams.set("podDate", podDateFilter);
      if (podDateSignatureFilter) queryParams.set("podDateSignature", podDateSignatureFilter.trim());
      if (jobNameFilter) queryParams.set("jobName", jobNameFilter.trim());
      // if (carrierFilter) queryParams.set("carrier", carrierFilter.trim());




      console.log("Query Params:", queryParams.toString());

      const response = await fetch(`/api/process-data/get-data/?${queryParams.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setMaster(data.jobs);
        setTotalPages(data.totalPages);
        setTotalJobs(data.totalJobs);
      } else {
        console.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [
    currentPage,
    bolNumberFilter,
    finalStatusFilter,
    reviewStatusFilter,
    reasonStatusFilter,
    reviewByStatusFilter,
    podDateFilter,
    podDateSignatureFilter,
    jobNameFilter,
    // carrierFilter,
  ]);

  // useEffect(() => {
  //   fetchJobs();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentPage]);

  const handleFilterApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // localStorage.setItem("jobName", jobNameFilter);
    fetchJobs();
  };

  const resetFiltersAndFetch = () => {
    Promise.resolve().then(() => {
      setFinalStatusFilter("");
      setReviewStatusFilter("");
      setReasonStatusFilter("");
      setReviewByStatusFilter("");
      // setCarrierFilter("");
      setBolNumberFilter("");
      setPodDateFilter("");
      setPodDateSignatureFilter("");
      setJobNameFilter("");
    }).then(() => {
      fetchJobs();
    });
  };

  // const fetchJobs = useCallback(async () => {
  //   try {
  //     setLoadingTable(true);

  //     const queryParams = new URLSearchParams();
  //     queryParams.set("page", currentPage.toString());

  //     let hasFilters = false;
  //     if (bolNumberFilter) {
  //       queryParams.set("bolNumber", bolNumberFilter.trim());
  //       hasFilters = true;
  //     }
  //     if (finalStatusFilter) {
  //       queryParams.set("finalStatus", finalStatusFilter);
  //       hasFilters = true;
  //     }
  //     if (reviewStatusFilter) {
  //       queryParams.set("reviewStatus", reviewStatusFilter);
  //       hasFilters = true;
  //     }
  //     if (reviewByStatusFilter) {
  //       queryParams.set("reviewByStatus", reviewByStatusFilter);
  //       hasFilters = true;
  //     }
  //     if (podDateFilter) {
  //       queryParams.set("podDate", podDateFilter);
  //       hasFilters = true;
  //     }
  //     if (podDateSignatureFilter) {
  //       queryParams.set("podDateSignature", podDateSignatureFilter.trim());
  //       hasFilters = true;
  //     }
  //     if (carrierFilter) {
  //       queryParams.set("carrier", carrierFilter.trim());
  //       hasFilters = true;
  //     }

  //     if (!hasFilters && currentPage === 1) {
  //       console.log("No filters applied, skipping data fetch.");
  //       return;
  //     }

  //     console.log("Query Params:", queryParams.toString());

  //     const response = await fetch(`/api/process-data/get-data/?${queryParams.toString()}`);

  //     if (response.ok) {
  //       const data = await response.json();
  //       setMaster(data.jobs);
  //       setTotalPages(data.totalPages);
  //       setTotalJobs(data.totalJobs);
  //     } else {
  //       console.error("Failed to fetch jobs");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching jobs:", error);
  //   } finally {
  //     setLoadingTable(false);
  //   }
  // }, [
  //   currentPage,
  //   bolNumberFilter,
  //   finalStatusFilter,
  //   reviewStatusFilter,
  //   reviewByStatusFilter,
  //   podDateFilter,
  //   podDateSignatureFilter,
  //   carrierFilter,
  // ]);

  // useEffect(() => {
  //   fetchJobs();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentPage]);

  // const handleFilterApply = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   fetchJobs();
  // };

  // const resetFiltersAndFetch = () => {
  //   Promise.resolve().then(() => {
  //     setFinalStatusFilter("");
  //     setReviewStatusFilter("");
  //     setReviewByStatusFilter("");
  //     setCarrierFilter("");
  //     setBolNumberFilter("");
  //     setPodDateFilter("");
  //     setPodDateSignatureFilter("");
  //   }).then(() => {
  //     setMaster([]);
  //     setTotalPages(0);
  //     setTotalJobs(0);
  //   });
  // };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  }

  // const handleDelete = () => {
  //   Swal.fire({
  //     title: 'Delete Files',
  //     text: 'Are you sure you want to delete these files?',
  //     icon: 'warning',
  //     iconColor: '#005B97',
  //     showCancelButton: true,
  //     confirmButtonColor: '#005B97',
  //     cancelButtonColor: '#E0E0E0',
  //     confirmButtonText: 'Delete',
  //   }).then((result) => {
  //     if (result.isConfirmed) {

  //        // Filter out the selected rows from the master array
  //        const updatedMaster = master.filter((job) => !selectedRows.includes(job._id));
  //        // Update the master state
  //        setMaster(updatedMaster);
  //        // Clear selected rows after deletion
  //        setSelectedRows([]);

  //       Swal.fire({
  //         title: 'Deleted!',
  //         text: 'Your files have been deleted.',
  //         icon: 'success',
  //         timer: 2000, // Auto-close after 2 seconds
  //         showConfirmButton: false, // Hide the confirm button
  //       });
  //     }
  //   });
  // };

  const handleSend = () => {
    Swal.fire({
      title: 'Send Files',
      text: 'Are you sure you want to send these files?',
      icon: 'warning',
      iconColor: '#AF9918',
      showCancelButton: true,
      confirmButtonColor: '#AF9918',
      cancelButtonColor: '#E0E0E0',
      confirmButtonText: 'Yes Sure!',
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedRows([]);
        Swal.fire({
          title: 'Sent!',
          text: 'Your files have been Sent.',
          icon: 'success',
          timer: 2000, // Auto-close after 2 seconds
          showConfirmButton: false, // Hide the confirm button
        });
      }
    });
  };

  useEffect(() => {
    setShowButton(selectedRows.length > 0);
  }, [selectedRows]);


  if (loading) return <Spinner />;
  if (!isAuthenticated) return <p>Access Denied. Redirecting...</p>;


  return (
    <div className="flex flex-row h-screen bg-white">
      <Sidebar onToggleExpand={handleSidebarToggle} />
      <div
        className={`flex-1 flex flex-col transition-all bg-white duration-300 ${isSidebarExpanded ? "ml-64" : "ml-24"
          }`}
      >
        <Header
          leftContent="Extracted Data Monitoring"
          totalContent={totalJobs}
          rightContent={<>
            <div className="flex gap-4 mr-3">
              {/* <div className="flex gap-2">
                <span>
                  <BiSolidEditAlt className="fill-[#005B97] text-2xl" />
                </span>
                <span className="text-[#005B97]">
                  Edit
                </span>
              </div> */}

              {showButton && (<>
                <div
                  className="flex gap-2 group cursor-pointer transition-all duration-300"
                  onClick={handleDelete}
                >
                  <span>
                    <MdDelete
                      className="fill-[red] text-2xl transition-transform transform group-hover:scale-110 group-hover:duration-300"
                    />
                  </span>
                  <span
                    className="text-[red] transition-all duration-300 group-hover:text-red-600  group-hover:duration-300"
                  >
                    Delete
                  </span>
                </div>

                <div
                  className="flex gap-2 group cursor-pointer transition-all duration-300"
                  onClick={handleSend}
                >
                  <span>
                    <GiShare
                      className="fill-[#AF9918] text-2xl transition-transform transform group-hover:scale-110 group-hover:duration-300"
                    />
                  </span>
                  <span
                    className="text-[#AF9918] transition-all duration-300 group-hover:text-[#D5A100]"
                  >
                    Send
                  </span>
                </div>
              </>

              )
              }

            </div>
          </>
          }
          buttonContent={
            <Link href="/history">
              <button className="bg-[#005B97] rounded-lg py-2 px-10 text-white md:mt-0 w-60 md:w-auto">
                History
              </button>
            </Link>

          }
        />


        <div className="flex-1 px-2 bg-white ">

          <div
            className={`bg-gray-200 p-3 mb-0 transition-all duration-500 ease-in-out w-full sm:w-auto ${isFilterDropDownOpen ? "rounded-t-lg" : "rounded-lg"}`}
          >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsFilterDropDownOpen(!isFilterDropDownOpen)}>
              <span className="text-gray-800 text-sm sm:text-base md:text-lg">
                Filters
              </span>
              <span>
                <IoIosArrowForward
                  className={`text-xl p-0 text-[#005B97] transition-all duration-500 ease-in-out ${isFilterDropDownOpen ? 'rotate-90' : ''}`}
                />
              </span>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out w-auto ${isFilterDropDownOpen ? "max-h-[1000px] p-3" : "max-h-0"
              } flex flex-wrap gap-4 mt-0 bg-gray-200 rounded-b-lg`}
          >

            <form
              onSubmit={handleFilterApply}
              className="w-full grid grid-cols-3 gap-4"
            >

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  BL Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Bl Number"
                    value={bolNumberFilter}
                    onChange={(e) => setBolNumberFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <FiSearch size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Recognition Status
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                    value={finalStatusFilter}
                    onChange={(e) => setFinalStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="new">new</option>
                    <option value="inProgress">inProgress</option>
                    <option value="valid">valid</option>
                    <option value="partiallyValid">partiallyValid</option>
                    <option value="failure">failure</option>
                    <option value="sent">sent</option>
                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Review Status
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="unConfirmed">unConfirmed</option>
                    <option value="confirmed">confirmed</option>
                    <option value="deleted">deleted</option>
                    <option value="denied">denied</option>

                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              {/* <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  Carrier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Add"
                    value={carrierFilter}
                    onChange={(e) => setCarrierFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <IoCopyOutline size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div> */}

              {/* <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  POD Date
                </label>
                <div className="relative">
                  <input
                    id="dateInput"
                    type="date"
                    placeholder="Date"
                    value={podDateFilter}
                    onChange={(e) => setPodDateFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => {
                      const dateInput = document.getElementById('dateInput') as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker();
                      }
                    }}
                  >
                    <IoCalendar size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div> */}

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  POD Date
                </label>
                <div className="relative">
                  <input
                    id="dateInput"
                    type="date"
                    placeholder="YYYY-MM-DD" // Indicates the format to users
                    value={podDateFilter}
                    onChange={(e) => setPodDateFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] custom-date-input"
                    max="9999-12-31"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => {
                      const dateInput = document.getElementById('dateInput') as HTMLInputElement;
                      if (dateInput) {
                        dateInput.showPicker();
                      }
                    }}
                  >
                    <IoCalendar size={20} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  POD Signature
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Signature"
                    value={podDateSignatureFilter}
                    onChange={(e) => setPodDateSignatureFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Reviewed By
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                    value={reviewByStatusFilter}
                    onChange={(e) => setReviewByStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="Standard User">Standard User</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="OCR Engine">OCR Engine</option>

                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="finalStatusFilter" className="text-sm font-semibold text-gray-800">
                  Breakdown Reason
                </label>
                <div className="relative">
                  <select
                    id="finalStatusFilter"
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97] appearance-none"
                    value={reasonStatusFilter}
                    onChange={(e) => setReasonStatusFilter(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="none">none</option>
                    <option value="damaged">damaged</option>
                    <option value="shortage">shortage</option>
                    <option value="overage">overage</option>
                    <option value="refused">refused</option>

                  </select>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-[25px] transform -translate-y-1/2 text-gray-500"
                  >
                    <FaChevronDown size={16} className="text-[#005B97]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="search" className="text-sm font-semibold text-gray-800">
                  Job Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Job name"
                    value={jobNameFilter}
                    onChange={(e) => setJobNameFilter(e.target.value)}
                    className="w-full px-4 py-2 mt-1 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005B97]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                  </button>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 col-span-3">
                <button
                  className="text-[#005B97] underline cursor-pointer"
                  onClick={resetFiltersAndFetch}
                >
                  Reset Filters
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005B97] text-white rounded-lg hover:bg-[#2270a3]"
                >
                  Apply Filters
                </button>

              </div>
            </form>
          </div>

          <div className="mb-5">

          </div>

          <div className="py-3">

            {loadingTable ? (
              <div className="flex justify-center items-end">
                <Spinner />
              </div>
            ) : master.length === 0 ? (
              <div className="flex flex-col items-center mt-20">
                <span className=" text-gray-800 text-xl shadow-xl p-4 rounded-lg">No data found</span>
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse border border-gray-200">
                  <thead>
                    <tr className="text-gray-800 bg-gray-100">
                      <th className="py-2 px-4 border-b text-start min-w-[120px]">
                        <span className="mr-3">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                          />
                        </span>
                        BL Number
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[100px]">
                        Job Name
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[100px]">
                        POD Date
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[120px]">
                        POD Signature
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Total Qty
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Delivered
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Damaged
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Short
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Over
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[80px]">
                        Refused
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[100px]">
                        Seal Intact
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[140px]">
                        Final Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[140px]">
                        Review Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[160px]">
                        Recognition Status
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[160px]">
                        Breakdown Reason
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[140px]">
                        Reviewed By
                      </th>
                      <th className="py-2 px-4 border-b text-center min-w-[120px]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody >
                    {master.map((job) => (
                      <tr key={job._id} className="text-gray-500">
                        <td className="py-2 px-4 border-b text-start m-0" ><span className="mr-3"><input type="checkbox" checked={selectedRows.includes(job._id)}
                          onChange={() => handleRowSelection(job._id)} /></span>
                          <Link
                            onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                            href={`/extracted-data-monitoring/${job._id}`}
                            className="group"
                          >
                            <span className="text-[#005B97] underline group-hover:text-blue-500 transition-all duration-500 transform group-hover:scale-110">
                              {job.blNumber}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.jobName}
                        </td>
                        {/* <td className="py-2 px-4 border-b text-center">{job.carrier}</td> */}
                        <td className="py-2 px-4 border-b text-center">{job.podDate}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.podSignature === "" || job.podSignature === null || job.podSignature === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.podSignature}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.totalQty === null || job.totalQty === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : (
                            job.totalQty
                          )}

                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.delivered === null || job.delivered === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.delivered}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.damaged === null || job.damaged === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.damaged}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.short === null || job.short === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.short}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.over === null || job.over === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.over}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.refused === null || job.refused === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.refused}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {job.sealIntact === null || job.sealIntact === undefined ? (
                            <span className="flex justify-center items-center">
                              <IoIosInformationCircle className="text-2xl text-red-500" />
                            </span>
                          ) : job.sealIntact}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            ref={(el: HTMLDivElement | null) => {
                              if (el) {
                                parentRefFinal.current[job._id] = el;
                              }
                            }}
                            className={`inline-flex z-40 items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${finalStatusStyles[job.finalStatus]
                              }`}
                            onClick={() => toggleDropdown(job._id)}
                          >
                            <div>{job.finalStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStates === job._id ? "rotate-180" : ""
                                  }`}
                              />
                            </div>
                          </div>
                          <Dropdown job={job} />
                        </td>



                        <td className="py-2 px-4 border-b text-center">
                          <div
                            ref={(el: HTMLDivElement | null) => {
                              if (el) {
                                parentRefReview.current[job._id] = el;
                              }
                            }}
                            className={`inline-flex z-40 items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${reviewStatusStyles[job.reviewStatus]
                              }`}
                            onClick={() => toggleDropdownFirst(job._id)}
                          >
                            <div>{job.reviewStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesFirst === job._id ? "rotate-180" : ""
                                  }`}
                              />
                            </div>
                          </div>
                          <DropdownReview job={job} />
                        </td>

                        <td className="py-2 px-4 border-b text-center">
                          <div
                            ref={(el: HTMLDivElement | null) => {
                              if (el) {
                                parentRefRecognition.current[job._id] = el;
                              }
                            }}
                            className={`inline-flex z-40 items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${recognitionStatusStyles[job.recognitionStatus]
                              }`}
                            onClick={() => toggleDropdownSecond(job._id)}
                          >
                            <div>{job.recognitionStatus}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesSecond === job._id ? "rotate-180" : ""
                                  }`}
                              />
                            </div>
                          </div>
                          <DropdownRecognition job={job} />
                        </td>

                        <td className="py-2 px-4 border-b text-center">
                          <div
                            ref={(el: HTMLDivElement | null) => {
                              if (el) {
                                parentRefBreakdown.current[job._id] = el;
                              }
                            }}
                            className={`inline-flex z-40 items-center transition-all duration-500 ease-in-out justify-center gap-0 px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${breakdownReasonStyles[job.breakdownReason]
                              }`}
                            onClick={() => toggleDropdownThird(job._id)}
                          >
                            <div>{job.breakdownReason}</div>
                            <div className="relative">
                              <RiArrowDropDownLine
                                className={`text-2xl p-0 transform transition-transform duration-300 ease-in-out ${dropdownStatesThird === job._id ? "rotate-180" : ""
                                  }`}
                              />
                            </div>
                          </div>
                          <DropdownBreakdown job={job} />
                        </td>

                        <td className="py-2 px-4 border-b text-center">{job.reviewedBy}</td>
                        <td className="py-2 px-6 border-b text-center">
                          <Link
                            onClick={() => { handleRouteChange(); localStorage.setItem("prev", "") }}
                            href={`/extracted-data-monitoring/edit-pdf/${job._id}`}
                            className="underline text-[#005B97] flex items-center gap-1 transition-all duration-300 hover:text-blue-500 group"
                          >
                            Detail
                            <span
                              className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                            >
                              <IoIosArrowForward className="text-xl p-0" />
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>

              </div>

            )}

            {master.length !== 0 && (
              <div className="mt-5 flex justify-end gap-5 items-center text-gray-800">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  Next
                </button>
              </div>
            )}

          </div>

        </div>

      </div >
    </div >
  );
};

export default MasterPage;
