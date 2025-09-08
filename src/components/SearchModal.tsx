import React, { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, User, Settings, Play, Folder, Image, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'person' | 'file' | 'folder';
  name: string;
  status?: string;
  details?: string;
  avatar?: string;
  icon?: React.ReactNode;
}

const mockData: SearchResult[] = [
  {
    id: '1',
    type: 'person',
    name: 'Randall Johnsson',
    status: 'Active now',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '2',
    type: 'folder',
    name: 'Random Michal Folder',
    details: '12 Files • in Photos • Edited 12m ago',
    icon: <Folder className="w-5 h-5 text-gray-500" />
  },
  {
    id: '3',
    type: 'file',
    name: 'crative_file_frandkies.jpg',
    details: 'in Photos/Assets • Edited 12m ago',
    icon: <Image className="w-5 h-5 text-gray-500" />
  },
  {
    id: '4',
    type: 'person',
    name: 'Kristinge Karand',
    status: 'Active 2d ago',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '5',
    type: 'file',
    name: 'files_krande_michelle.avi',
    details: 'in Videos • Added 12m ago',
    icon: <Play className="w-5 h-5 text-gray-500" />
  }
];

const SearchModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('Rand');
  const [activeTab, setActiveTab] = useState<'all' | 'files' | 'people'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [filters] = useState({
    files: true,
    people: true,
    chats: false,
    lists: false
  });
  const settingsRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    }, 500); // 500ms delay before showing results
  };

  // Handle clear button
  const handleClear = () => {
    setSearchQuery('');
    setIsTyping(false);
    setShowResults(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-orange-200 text-orange-800">
          {part}
        </span>
      ) : part
    );
  };

  const filteredResults = mockData.filter(result => {
    if (activeTab === 'files') return result.type === 'file' || result.type === 'folder';
    if (activeTab === 'people') return result.type === 'person';
    return true;
  });

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'person') {
      return (
        <div className="relative">
          <img 
            src={result.avatar} 
            alt={result.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
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
    if (status?.includes('Active now')) return 'text-green-600';
    if (status?.includes('Active')) return 'text-gray-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl p-4 sm:p-6">
        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          {isTyping ? (
            <Loader2 className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full pl-10 sm:pl-12 pr-16 sm:pr-20 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm sm:text-base underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 border-b-2 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'all' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All {filteredResults.length}
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-2 border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'files' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Files {mockData.filter(r => r.type === 'file' || r.type === 'folder').length}</span>
              <span className="sm:hidden">{mockData.filter(r => r.type === 'file' || r.type === 'folder').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`pb-2 border-b-2 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'people' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">People {mockData.filter(r => r.type === 'person').length}</span>
              <span className="sm:hidden">{mockData.filter(r => r.type === 'person').length}</span>
            </button>
          </div>
          
          {/* Settings Dropdown */}
          <div className="relative flex-shrink-0" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">Files</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.files ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.files ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">People</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.people ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.people ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                      <span className="text-xs sm:text-sm">Chats</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.chats ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.chats ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                      <span className="text-xs sm:text-sm">Lists</span>
                    </div>
                    <div className={`w-8 h-4 sm:w-10 sm:h-5 rounded-full ${filters.lists ? 'bg-black' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.lists ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-2 sm:space-y-3">
          {showResults ? (
            filteredResults.map((result, index) => {
              const delayClass = index === 0 ? '' : index === 1 ? 'animate-delay-100' : index === 2 ? 'animate-delay-200' : index === 3 ? 'animate-delay-300' : index === 4 ? 'animate-delay-400' : 'animate-delay-500';
              return (
                <div 
                  key={result.id} 
                  className={`flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer animate-fadeInUp ${delayClass}`}
                >
                <div className="flex-shrink-0">
                  {getResultIcon(result)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {highlightText(result.name, searchQuery)}
                  </div>
                  {result.status && (
                    <div className={`text-xs ${getStatusColor(result.status)}`}>
                      {result.status}
                    </div>
                  )}
                  {result.details && (
                    <div className="text-xs text-gray-500 truncate">
                      {result.details}
                    </div>
                  )}
                </div>
              </div>
              );
            })
          ) : (
            // Loading skeleton
            <div className="space-y-2 sm:space-y-3">
              {[1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 animate-pulse"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
