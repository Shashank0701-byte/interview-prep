import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SummaryCard from '../../components/Cards/SummaryCard';
import Modal from '../../components/Modal';
import CreateSessionForm from './CreateSessionForm';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from "moment";
import { CARD_BG } from "../../utils/data";


const Dashboard = () => {
    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewCount, setReviewCount] = useState(0);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        open: false,
        data: null,
    });

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [sessionsRes, reviewRes] = await Promise.all([
                axiosInstance.get(API_PATHS.SESSIONS.GET_MY_SESSIONS),
                axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE)
            ]);
            
            if (sessionsRes.data?.sessions) {
                setSessions(sessionsRes.data.sessions);
            }
            if (reviewRes.data?.reviewQueue) {
                setReviewCount(reviewRes.data.reviewQueue.length);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data.");
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteSession = async (sessionData) => {
        try {
            await axiosInstance.delete(API_PATHS.SESSIONS.DELETE(sessionData._id));
            toast.success("Session Deleted Successfully");
            setOpenDeleteAlert({ open: false, data: null });
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to delete session.");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <DashboardLayout>
            <div className='container mx-auto pt-4 pb-4'>
                <div className="px-4 md:px-0 mb-6">
                    {reviewCount > 0 && (
                        <Link to="/review" className="w-full md:w-auto btn-primary inline-block text-center">
                            Start Review ({reviewCount} {reviewCount === 1 ? 'card' : 'cards'} due)
                        </Link>
                    )}
                    <Link 
  to="/progress" 
  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] 
             text-white font-semibold px-5 py-2.5 rounded-full shadow-lg 
             hover:scale-105 transition-transform duration-300"
>
  <span>📈 My Progress</span>
</Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0'>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : sessions.length > 0 ? (
                        sessions.map((data, index) => (
                            <SummaryCard
                                key={data._id}
                                colors={CARD_BG[index % CARD_BG.length]} 
                                role={data.role}
                                topicsToFocus={data.topicsToFocus}
                                experience={data.experience}
                                questions={data.questions.length}
                                lastUpdated={moment(data.updatedAt).format("Do MMM YYYY")}
                                onSelect={() => navigate(`/interview-prep/${data._id}`)}
                                onDelete={() => setOpenDeleteAlert({ open: true, data })}
                            />
                        ))
                    ) : (
                        <p className="col-span-3 text-slate-500">No sessions found. Click "Add New" to get started!</p>
                    )}
                </div>
                <button
                    className='h-12 md:h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full fixed bottom-10 right-10'
                    onClick={() => setOpenCreateModal(true)}
                >
                    <LuPlus className='text-2xl text-white' /> Add New
                </button>
            </div>
            <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader>
                <CreateSessionForm onSuccess={() => {
                    setOpenCreateModal(false);
                    fetchDashboardData();
                }} />
            </Modal>
            <Modal isOpen={openDeleteAlert.open} onClose={() => setOpenDeleteAlert({ open: false, data: null })} title="Delete Session">
                <div className='w-[30vw]'>
                    <DeleteAlertContent
                        content="Are you sure you want to delete this session?"
                        onDelete={() => deleteSession(openDeleteAlert.data)}
                        onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
                    />
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default Dashboard;
