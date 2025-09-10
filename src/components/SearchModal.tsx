  import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiFolder,
  HiLink,
  HiExternalLink,
  HiMenu,
} from "react-icons/hi";
import { CiUser } from "react-icons/ci";
import { MdAttachFile } from "react-icons/md";
import { GoGear } from "react-icons/go";
import { IoPlay } from "react-icons/io5";

import { IoChatbubbleOutline } from "react-icons/io5";

import { LuSearch } from "react-icons/lu";
import { FaImage } from "react-icons/fa6";
import { CgCheck } from "react-icons/cg";


interface SearchResult {
  id: string;
  type: "person" | "file" | "folder" | "chat" | "list";
  name: string;
  status?: string;
  details?: string;
  avatar?: string;
  icon?: React.ReactNode;
}

// Custom filled icon components
const FilledFolder = () => (
  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
    <HiFolder className="w-5 h-5 text-gray-400" />
  </div>
);

const FilledImage = () => (
  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
    <FaImage className="w-5 h-5 text-gray-400" />
  </div>
);

const FilledVideo = () => (
    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
    <IoPlay className="w-5 h-5 text-gray-400" />
  </div>
);

const mockData: SearchResult[] = [
  {
    id: "1",
    type: "person",
    name: "Randall Johnsson",
    status: "Active now",
    avatar:
      "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000",
  },
    {
      id: "2",
      type: "folder",
      name: "Random Michael Folder",
      details: "12 Files • in Photos • Edited 12m ago",
      icon: <FilledFolder />,
    },
    {
      id: "3",
      type: "file",
      name: "crative_file_frandkies.jpg",
      details: "in Photos/Assets • Edited 12m ago",
      icon: <FilledImage />,
    },
  {
    id: "4",
    type: "person",
    name: "Kristinge Karand",
    status: "Active 2d ago",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  },
    {
      id: "5",
      type: "file",
      name: "files_krande_michelle.avi",
      details: "in Videos • Added 12m ago",
      icon: <FilledVideo />,
    },
  {
    id: "6",
    type: "person",
    name: "Anurag MK",
    details: "Active 2d ago",
    avatar:"https://imgv3.fotor.com/images/gallery/Realistic-Male-Profile-Picture.jpg"
  },
  {
    id: "7",
    type: "file",
    name: "files_krande_michelle.avi",
    details: "in Videos • Added 12m ago",
    icon: <FilledVideo />,
  },
];

const SearchModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "files" | "people" | "chats" | "lists"
  >("all");
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [isCleared, setIsCleared] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    files: true,
    people: true,
    chats: false,
    lists: false,
  });
  const settingsRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle typing animation
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Only start opening animation if we have text and are in cleared state
    if (value.length > 0 && isCleared) {
      setIsCleared(false);
      setIsOpening(true);
      setIsFocused(true);
      setIsTyping(true);
      setShowResults(false);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to complete opening animation
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setShowResults(true);
        setIsOpening(false);
      }, 50);
    } else if (value.length > 0) {
      // Normal typing behavior when not in cleared state
      setIsFocused(true);
      setIsTyping(true);
      setShowResults(false);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop loading animation
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setShowResults(true);
      }, 1000);
    } else {
      // If text is cleared, go back to cleared state
      setIsCleared(true);
      setIsFocused(false);
      setIsTyping(false);
      setShowResults(false);
      setIsOpening(false);
    }
  };

  // Handle clear button (immediate; exit handled by motion)
  const handleClear = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setShowResults(false);
    setIsTyping(false);
    setIsOpening(false);
    setIsClearing(false);
    setIsCleared(true);
    setIsFocused(false);
    setSearchQuery("");

    const input = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (input) input.blur();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-orange-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle filter toggle changes
  const handleFilterToggle = (filterType: keyof typeof filters) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterType]: !prev[filterType],
      };

      // If the currently active tab is being disabled, switch to 'all'
      if (!newFilters[filterType]) {
        if (
          (filterType === "files" && activeTab === "files") ||
          (filterType === "people" && activeTab === "people") ||
          (filterType === "chats" && activeTab === "chats") ||
          (filterType === "lists" && activeTab === "lists")
        ) {
          setActiveTab("all");
        }
      }

      return newFilters;
    });
  };

  const filteredResults = mockData
    .filter((result) => {
      // First filter by active tab
      if (activeTab === "files")
        return result.type === "file" || result.type === "folder";
      if (activeTab === "people") return result.type === "person";
      if (activeTab === "chats") return result.type === "chat";
      if (activeTab === "lists") return result.type === "list";

      // For 'all' tab, filter by enabled filters
      if (result.type === "person") return filters.people;
      if (result.type === "file" || result.type === "folder")
        return filters.files;
      if (result.type === "chat") return filters.chats;
      if (result.type === "list") return filters.lists;

      return true;
    })
    .sort((a, b) => {
      // If there's no search query, maintain original order
      if (!searchQuery.trim()) return 0;
      
      const query = searchQuery.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Check for exact matches first
      const aExactMatch = aName === query;
      const bExactMatch = bName === query;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Check for starts with matches
      const aStartsWith = aName.startsWith(query);
      const bStartsWith = bName.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Check for contains matches
      const aContains = aName.includes(query);
      const bContains = bName.includes(query);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      
      // If both have same match type, sort alphabetically
      return aName.localeCompare(bName);
    });

  const getResultIcon = (result: SearchResult) => {
    if (result.type === "person") {
      return (
        <div className="relative">

          <img
            src={result.avatar}
            alt={result.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
        {result.icon}
      </div>
    );
  };

  const getStatusColor = (status?: string) => {
    if (status?.includes("Active now")) return "text-green-600";
    if (status?.includes("Active")) return "text-gray-500";
    return "text-gray-400";
  };

  // Handle copying link
  const handleCopyLink = async (result: SearchResult) => {
    let link = "";
    
    if (result.type === "person" && result.avatar) {
      // For people, copy the avatar URL
      link = result.avatar;
    } else if (result.type === "file") {
      // For files, create a file path or URL
      link = `https://example.com/files/${result.name}`;
    } else if (result.type === "folder") {
      // For folders, create a folder path
      link = `https://example.com/folders/${result.name}`;
    } else {
      // Fallback to a generic link
      link = `https://example.com/${result.type}/${result.id}`;
    }
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedItem(result.id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Handle opening in new tab
  const handleOpenNewTab = (result: SearchResult) => {
    let link = "";
    
    if (result.type === "person" && result.avatar) {
      // For people, open the avatar URL
      link = result.avatar;
    } else if (result.type === "file") {
      // For files, create a file path or URL
      link = `https://example.com/files/${result.name}`;
    } else if (result.type === "folder") {
      // For folders, create a folder path
      link = `https://example.com/folders/${result.name}`;
    } else {
      // Fallback to a generic link
      link = `https://example.com/${result.type}/${result.id}`;
    }
    
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-2 flex items-center justify-center  sm:p-2">
      <div className="bg-white rounded-xl  sm:rounded-2xl relative shadow-lg w-full sm:max-w-md md:max-w-lg lg:max-w-2xl">
        {/* Search Bar */}
        <div className="relative px-4 py-4 sm:px-8 mb-4 sm:mb-0">
      {/* Search / Loader Icon */}
      {isTyping ? (
        <div className=" absolute top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5">
          <svg className="w-full rotate-spin animate-spin h-full" viewBox="0 0 24 24">
            {/* <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#d1d5db"
              strokeWidth="2"
              fill="none"
            /> */}
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              strokeDasharray="62.83"
              strokeDashoffset="62.83"
              className="rotate-spin animate-[spinner_1.2s_linear_infinite] spinner-circle"
            />
          </svg>
        </div>
      ) : (
        <LuSearch
          size={20}
          className="absolute top-1/2  transform -translate-y-1/2 text-gray-400"
        />
      )}

      {/* Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Searching is easier..."
        className="w-full pl-8 pr-20 py-2.5 placeholder:text-gray-400 sm:py-3 text-sm sm:text-lg font-medium text-black rounded-lg sm:rounded-xl bg-white focus:outline-none"
      />

      {/* Right side: quick access / clear */}
      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {searchQuery ? (
          <button
            onClick={handleClear}
            className="cursor-pointer font-medium mr-4 hover:text-gray-600 text-sm sm:text-base underline"
          >
            Clear
          </button>
        ) : (
          <>
            <div className={`ml-auto flex items-center justify-center space-x-2 transition-all duration-300 ease-out ${
                isTyping ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
              }`}>
                <div className="w-6 h-6 border mt-2 border-gray-200 rounded-lg border-t-2 flex items-center justify-center">
                  <div className="rounded-lg mb-1 border border-t-white border-gray-200 w-6 h-5 flex items-center justify-center ">

                  <span className="text-sm text-gray-500 text-md font-medium mb-1">s</span>
                  </div>
                </div>
                <span className="text-gray-400 text-md hidden sm:flex font-medium">quick access</span>
              </div>
          </>
        )}
      </div>
    </div>

        {/* Filter Tabs */}
        {!isCleared && isFocused && (
           <div
             className={`flex items-end border-b-2 border-gray-200 justify-between mb-4 sm:mb-6 transition-all duration-300 ease-out relative z-40 ${
               isClearing
                 ? "opacity-0 transform -translate-y-3 scale-95"
                 : isOpening
                 ? "opacity-0 transform translate-y-3 scale-95"
                 : "opacity-100 transform translate-y-0 scale-100"
             }`}
           >
            <div className="flex px-4 sm:px-8 space-x-2 sm:space-x-3 md:space-x-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`pb-2 font-medium cursor-pointer border-b-2 whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out ${
                    activeTab === "all"
                      ? "border-black font-medium text-black"
                      : "border-transparent text-gray-400 hover:text-gray-600 "
                  }`}
                >
                All <span className="bg-gray-200  text-gray-400 font-medium px-1.5 rounded-md">{
                  mockData.filter((result) => {
                    if (result.type === "person") return filters.people;
                    if (result.type === "file" || result.type === "folder") return filters.files;
                    if (result.type === "chat") return filters.chats;
                    if (result.type === "list") return filters.lists;
                    return true;
                  }).length
                }</span>
              </button>
              {filters.files && (
                <button
                  onClick={() => setActiveTab("files")}
                  className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out ${
                    activeTab === "files"
                      ? "border-black font-medium text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MdAttachFile size={18} className="rotate-225" />
                  <span className={`hidden sm:inline font-medium ${activeTab === "files" ? "text-black" : "text-gray-400"}`}>
                    Files <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "files" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter(
                        (r) =>
                          (r.type === "file" || r.type === "folder") &&
                          filters.files
                      ).length}</span>
                  </span>
                  <span className="sm:hidden">
                    <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "files" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter(
                        (r) =>
                          (r.type === "file" || r.type === "folder") &&
                          filters.files
                      ).length}</span>
                  </span>
                </button>
              )}
              {filters.people && (
                <button
                  onClick={() => setActiveTab("people")}
                  className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out ${
                    activeTab === "people"
                      ? "border-black font-medium text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CiUser size={18}/>
                  <span className={`hidden sm:inline font-medium ${activeTab === "people" ? "text-black" : "text-gray-400"}`}>
                    People <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "people" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter(
                        (r) => r.type === "person" && filters.people
                      ).length}</span>
                  </span>
                  <span className="sm:hidden">
                    <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "people" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter(
                        (r) => r.type === "person" && filters.people
                      ).length}</span>
                  </span>
                </button>
              )}
              {filters.chats && (
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out ${
                    activeTab === "chats"
                      ? "border-black font-medium text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <IoChatbubbleOutline size={18} className="text-gray-500 rotate-280" />
                  <span className={`hidden sm:inline font-medium ${activeTab === "chats" ? "text-black" : "text-gray-400"}`}>
                      Chats <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "chats" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter((r) => r.type === "chat" && filters.chats)
                        .length}</span>
                  </span>
                  <span className={`sm:hidden ${activeTab === "chats" ? "text-black" : "text-gray-400"}`}>
                    {
                      mockData.filter((r) => r.type === "chat" && filters.chats)
                        .length
                    }
                  </span>
                </button>
              )}
              {filters.lists && (
                <button
                  onClick={() => setActiveTab("lists")}
                  className={`pb-2 cursor-pointer border-b-2 flex items-center space-x-1 whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out ${
                    activeTab === "lists"
                      ? "border-black font-medium text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <HiMenu size={18} className="text-gray-500  w-3 h-3 sm:w-4 sm:h-4" />{" "}
                  <span className={`hidden sm:inline font-medium ${activeTab === "lists" ? "text-black" : "text-gray-400"}`}>
                    Lists <span className={`bg-gray-200 font-medium px-1.5 rounded-md ${activeTab === "lists" ? "text-gray-600" : "text-gray-400"}`}>{mockData.filter((r) => r.type === "list" && filters.lists)
                        .length}</span>
                  </span>
                  <span className={`sm:hidden ${activeTab === "lists" ? "text-black" : "text-gray-400"}`}>
                    {
                      mockData.filter((r) => r.type === "list" && filters.lists)
                        .length
                    }
                  </span>
                </button>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="relative flex-shrink-0 px-4 sm:px-6 z-50" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 cursor-pointer sm:p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Settings"
              >
                <GoGear className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white  rounded-lg shadow-lg z-[60] ">
                  <div className="p-2 sm:p-3 space-y-1">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100  transition-colors">
                      <div className="flex items-center space-x-1.5 sm:space-x-1">
                          <MdAttachFile  size={20} className={`rotate-225 text-gray-500`} />
                        <span className={`text-xs sm:text-sm ${filters.files ? "text-black font-medium" : "text-gray-400 font-medium"}`}>Files</span>
                      </div>
                      <div
                        onClick={() => handleFilterToggle("files")}
                        className={`w-8 h-4 cursor-pointer sm:w-10 sm:h-5 rounded-full ${
                          filters.files ? "bg-black" : "bg-gray-300"
                        } relative`}
                      >
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                            filters.files
                              ? "translate-x-4 sm:translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100  transition-colors">
                      <div className="flex items-center space-x-1.5 sm:space-x-1">
                        <CiUser size={20} className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500`} />
                        <span className={`text-xs sm:text-sm ${filters.people ? "text-black font-medium" : "text-gray-400 font-medium"}`}>People</span>
                      </div>
                      <div
                        onClick={() => handleFilterToggle("people")}
                        className={`w-8 h-4 cursor-pointer sm:w-10 sm:h-5 rounded-full ${
                          filters.people ? "bg-black" : "bg-gray-300"
                        } relative`}
                      >
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                            filters.people
                              ? "translate-x-4 sm:translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100  transition-colors">
                      <div className="flex items-center space-x-1.5 sm:space-x-1">
                        <IoChatbubbleOutline size={20} className={`rotate-280 w-3 h-3 sm:w-4 sm:h-4 text-gray-500`} />

                        <span className={`text-xs sm:text-sm ${filters.chats ? "text-black font-medium" : "text-gray-400 font-medium"}`}>Chats</span>
                      </div>
                      <div
                        onClick={() => handleFilterToggle("chats")}
                        className={`w-8 h-4 cursor-pointer sm:w-10 sm:h-5 rounded-full ${
                          filters.chats ? "bg-black" : "bg-gray-300"
                        } relative`}
                      >
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                            filters.chats
                              ? "translate-x-4 sm:translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100  transition-colors">
                      <div className="flex items-center space-x-1.5 sm:space-x-1">
                        <HiMenu size={20} className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500`} />
                        <span className={`text-xs sm:text-sm ${filters.lists ? "text-black font-medium" : "text-gray-400 font-medium"}`}>Lists</span>
                      </div>
                      <div
                        onClick={() => handleFilterToggle("lists")}
                        className={`w-8 h-4 cursor-pointer sm:w-10 sm:h-5 rounded-full ${
                          filters.lists ? "bg-black" : "bg-gray-300"
                        } relative`}
                      >
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                            filters.lists
                              ? "translate-x-4 sm:translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        )}

        {/* Search Results */}
        <AnimatePresence>
        {!isCleared && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className={`px-4 sm:px-8 relative z-10 ${
              showSettings ? "pointer-events-none" : ""
            }`}
          >
             {showResults ? (
               <div>
                 {filteredResults.map((result, index) => {
                const delayClass =
                  index === 0
                    ? ""
                    : index === 1
                    ? "animate-delay-100"
                    : index === 2
                    ? "animate-delay-200"
                    : index === 3
                    ? "animate-delay-300"
                    : index === 4
                    ? "animate-delay-400"
                    : "animate-delay-500";
                return (
                  <div
                    key={result?.id}
                    className={`flex items-center space-x-3 sm:space-x-4  py-2 sm:py-3 hover:bg-gray-50 border-b border-gray-200 cursor-pointer animate-fadeInUp ${delayClass} group relative`}
                    onMouseEnter={() => setHoveredItem(result.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex-shrink-0">{getResultIcon(result)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {highlightText(result.name, searchQuery)}
                      </div>
                      {result.status && (
                        <div
                        className={`text-xs ${getStatusColor(result.status)}`}
                        >
                          {result.status}
                        </div>
                      )}
                      {result.details && (
                        <div className="text-xs text-gray-500 truncate">
                          {result.details}
                        </div>
                      )}
                    </div>

                    {(hoveredItem === result.id ||
                      result.type === "file" ||
                      result.type === "folder") && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(result);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded-full transition-colors relative"
                          title="Copy link"
                        >
                     
                            <HiLink className="w-4 h-4  cursor-pointer text-gray-500" />
                          
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNewTab(result);
                          }}
                          className="p-1.5 cursor-pointer flex items-center text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Open in new tab"
                        >
                          <HiExternalLink className="w-4 h-4  text-gray-500" /><span className="text-xs font-medium pl-2 sm:text-sm"> New Tab</span>
                        </button>
                      </div>
                    )}

                      {copiedItem === result.id && (
                        <div className="absolute -top-2 right-18 flex items-center justify-center bg-black text-white text-xs px-2  rounded whitespace-nowrap z-20">
                          <CgCheck size={16} className="text-white mr-1"/> Link copied!
                        </div>
                      )}

                  </div>

                 );
               })}
               {filteredResults.length > 0 && (

                 <div className="border-b mb-4  border-gray-200"></div>
               )}

               </div>
             ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredResults.map((result,index) => {
                    const delayClass =
                    index === 0
                      ? ""
                      : index === 1
                      ? "animate-delay-100"
                      : index === 2
                      ? "animate-delay-200"
                      : index === 3
                      ? "animate-delay-300"
                      : index === 4
                      ? "animate-delay-400"
                      : "animate-delay-500";
                  return <div
                    key={result?.id}
                    className={`flex items-center border-b border-gray-200 space-x-3 sm:space-x-4  py-2 sm:py-2 hover:bg-gray-50  cursor-pointer animate-fadeInUp ${delayClass} group relative`}
                  > 
                    <div className="w-8 h-6 sm:w-10 sm:h-10 bg-gray-200 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
})}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchModal;

