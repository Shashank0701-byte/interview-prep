import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const CompanySelector = ({ onCompanySelect, selectedCompany }) => {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filteredCompanies, setFilteredCompanies] = useState([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.industry.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCompanies(filtered);
        } else {
            setFilteredCompanies(companies);
        }
    }, [searchTerm, companies]);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.COMPANIES.GET_ALL);
            setCompanies(response.data.data);
            setFilteredCompanies(response.data.data);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            case 'Extreme': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getInterviewStyleColor = (style) => {
        switch (style) {
            case 'Technical': return 'bg-blue-100 text-blue-800';
            case 'Behavioral': return 'bg-indigo-100 text-indigo-800';
            case 'Formal': return 'bg-gray-100 text-gray-800';
            case 'Casual': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Target Company (Optional)
                </label>
                <input
                    type="text"
                    placeholder="Search companies like Google, Meta, Amazon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Select a company to get questions specifically asked there
                </p>
            </div>
            
            {searchTerm && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading companies...</div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No companies found</div>
                    ) : (
                        filteredCompanies.map((company) => (
                            <div
                                key={company._id}
                                onClick={() => onCompanySelect(company)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                                    selectedCompany?._id === company._id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {company.logo && (
                                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {company.industry} • {company.size} • {company.location}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(company.culture.difficulty)}`}>
                                                {company.culture.difficulty}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getInterviewStyleColor(company.culture.interviewStyle)}`}>
                                                {company.culture.interviewStyle}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedCompany?._id === company._id && (
                                        <div className="text-blue-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {selectedCompany && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                🎯 Preparing for: {selectedCompany.name}
                            </p>
                            <p className="text-xs text-blue-700">
                                {selectedCompany.culture.interviewStyle} interviews • {selectedCompany.culture.difficulty} difficulty
                            </p>
                        </div>
                        <button
                            onClick={() => onCompanySelect(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySelector;
