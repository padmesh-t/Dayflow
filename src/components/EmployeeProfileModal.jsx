import React, { useState, useEffect } from 'react';
import { 
  X, User, Shield, CreditCard, Building, Phone, Mail, Calendar, Key, MapPin, 
  Plus, Edit3, Save, CheckCircle2, Lock, FileText, Award, Heart, Sparkles, Upload, DollarSign,
  Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PayslipModal from './PayslipModal';

export default function EmployeeProfileModal({ employee, onClose, onUpdateEmployee, viewOnly = false }) {
  const { currentUser, isAdmin, changePassword } = useAuth();
  
  const isOwnProfile = currentUser?.id === employee?.id;
  const isHR = currentUser?.role === 'HR Officer' || isAdmin;
  const canSeePrivateInfo = isOwnProfile || isHR;
  const canSeeSalaryInfo = isAdmin; // ADMIN ONLY per HRMS_Wireframe_Spec.md!
  const canEdit = !viewOnly && (isOwnProfile || isHR);

  const [activeTab, setActiveTab] = useState('resume');
  const [formData, setFormData] = useState({ ...employee });
  const [isEditing, setIsEditing] = useState(false);
  
  // Resume state
  const [skillsList, setSkillsList] = useState(employee?.skills ? employee.skills.split(',') : ['React', 'Node.js', 'SQL', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [certList, setCertList] = useState(employee?.certifications ? employee.certifications.split(',') : ['AWS Certified Developer', 'Odoo Certified Specialist']);
  const [newCert, setNewCert] = useState('');

  // Password Change state & visibility toggles
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPayslip, setShowPayslip] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      if (employee.skills) setSkillsList(employee.skills.split(',').filter(Boolean));
      if (employee.certifications) setCertList(employee.certifications.split(',').filter(Boolean));
    }
  }, [employee]);

  if (!employee) return null;

  // Auto Salary Calculations
  const monthlyWage = Number(formData.monthly_wage || formData.wage) || 50000;
  const yearlyWage = monthlyWage * 12;
  const basicPercent = Number(formData.basic_percent) || 50;
  const hraPercent = Number(formData.hra_percent) || 50;
  const pfPercent = Number(formData.pf_percent) || 12;
  const profTax = Number(formData.professional_tax) || 200;
  const workingDaysPerWeek = Number(formData.working_days_per_week) || 5;
  const breakHours = Number(formData.break_hours) || 1.0;

  const basic = Math.round((monthlyWage * basicPercent) / 100);
  const hra = Math.round((basic * hraPercent) / 100);
  const stdAllowance = Math.round(monthlyWage * 0.1667);
  const bonus = Math.round(basic * 0.0833);
  const lta = Math.round(basic * 0.0833);
  const fixedAllowance = Math.max(0, monthlyWage - (basic + hra + stdAllowance + bonus + lta));
  const pfEmployee = Math.round((basic * pfPercent) / 100);
  const pfEmployer = pfEmployee;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updated = [...skillsList, newSkill.trim()];
      setSkillsList(updated);
      handleChange('skills', updated.join(','));
      setNewSkill('');
    }
  };

  const handleAddCert = () => {
    if (newCert.trim()) {
      const updated = [...certList, newCert.trim()];
      setCertList(updated);
      handleChange('certifications', updated.join(','));
      setNewCert('');
    }
  };

  const handleSaveProfile = async () => {
    if (onUpdateEmployee) {
      await onUpdateEmployee(employee.id, formData);
    }
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar_url', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="relative group">
              {formData.avatar_url && formData.avatar_url.startsWith('data:') ? (
                <img src={formData.avatar_url} alt={formData.name} className="h-20 w-20 rounded-2xl object-cover border-2 border-white/20 shadow-md" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-2xl flex items-center justify-center border-2 border-white/20 shadow-md">
                  {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'EMP'}
                </div>
              )}
              {isOwnProfile && isEditing && (
                <label className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-xl border border-white cursor-pointer shadow-sm">
                  <Upload className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isEditing && (isAdmin || isHR) ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="text-2xl font-bold bg-white/10 text-white px-2 py-0.5 rounded-lg border border-white/20"
                  />
                ) : (
                  <h2 className="text-2xl font-bold tracking-tight">{formData.name}</h2>
                )}
                <span className="bg-indigo-500/20 text-indigo-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {formData.login_id || formData.loginId || 'OIJODO20250001'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  formData.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  formData.status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {formData.status === 'Present' ? '🟢 Present' : formData.status === 'On Leave' ? '✈️ On Leave' : '🟡 Absent'}
                </span>
              </div>

              <div className="text-sm text-indigo-300 font-medium mt-1 flex items-center gap-2">
                {isEditing && (isAdmin || isHR) ? (
                  <>
                    <input
                      type="text"
                      value={formData.job_position || formData.jobPosition || ''}
                      onChange={(e) => handleChange('job_position', e.target.value)}
                      placeholder="Job Position"
                      className="bg-white/10 text-white px-2 py-0.5 rounded-lg border border-white/20 text-xs"
                    />
                    <span>•</span>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="Department"
                      className="bg-white/10 text-white px-2 py-0.5 rounded-lg border border-white/20 text-xs"
                    />
                  </>
                ) : (
                  <span>{formData.job_position || formData.jobPosition} • {formData.department}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center space-x-1"><Mail className="h-3.5 w-3.5 text-indigo-400" /> <span>{formData.email}</span></span>
                <span className="flex items-center space-x-1">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" /> 
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20"
                    />
                  ) : (
                    <span>{formData.phone || '+91 98765 43210'}</span>
                  )}
                </span>
                <span className="flex items-center space-x-1"><Building className="h-3.5 w-3.5 text-indigo-400" /> <span>Odoo India</span></span>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" /> 
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20"
                    />
                  ) : (
                    <span>{formData.location || 'Chennai, India'}</span>
                  )}
                </span>
              </div>
            </div>

            {canEdit && (
              <div>
                {isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('resume')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 px-1 cursor-pointer ${
                activeTab === 'resume' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Resume
            </button>

            {canSeePrivateInfo && (
              <button
                onClick={() => setActiveTab('private')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 px-1 cursor-pointer ${
                  activeTab === 'private' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Private Info
              </button>
            )}

            {canSeeSalaryInfo && (
              <button
                onClick={() => setActiveTab('salary')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 px-1 flex items-center space-x-1 cursor-pointer ${
                  activeTab === 'salary' ? 'border-amber-400 text-amber-300' : 'border-transparent text-amber-400/70 hover:text-amber-300'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Salary Info (Admin Only)</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 px-1 cursor-pointer ${
                  activeTab === 'security' ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Security
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: RESUME */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              {/* About Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>About</span>
                </h4>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.about || ''}
                    onChange={(e) => handleChange('about', e.target.value)}
                    placeholder="Write a short summary about yourself..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {formData.about || 'Passionate team member dedicated to driving quality software and innovation at Dayflow.'}
                  </p>
                )}
              </div>

              {/* Love About Job & Hobbies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>What I Love About My Job</span>
                  </h4>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={formData.love_about_job || ''}
                      onChange={(e) => handleChange('love_about_job', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 font-medium">
                      {formData.love_about_job || 'Collaborating on complex system architecture and building sleek user interfaces.'}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>My Interests and Hobbies</span>
                  </h4>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={formData.hobbies || ''}
                      onChange={(e) => handleChange('hobbies', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 font-medium">
                      {formData.hobbies || 'Open-source contributing, chess, photography, and exploring tech podcasts.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills & Certifications Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skills */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-xl text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                      <button onClick={handleAddSkill} className="bg-indigo-600 text-white p-1.5 rounded-xl hover:bg-indigo-700 cursor-pointer">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span>Certifications</span>
                  </h4>
                  <div className="space-y-1.5 mb-3">
                    {certList.map((cert, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{cert}</span>
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCert}
                        onChange={(e) => setNewCert(e.target.value)}
                        placeholder="Add certification..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                      <button onClick={handleAddCert} className="bg-purple-600 text-white p-1.5 rounded-xl hover:bg-purple-700 cursor-pointer">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVATE INFO */}
          {activeTab === 'private' && canSeePrivateInfo && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Personal Details</h4>
                  
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Date of Birth:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dob || ''}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{formData.dob || '1998-05-14'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Gender:</span>
                    {isEditing ? (
                      <select
                        value={formData.gender || 'Male'}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      <span className="font-bold text-slate-800">{formData.gender || 'Male'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Marital Status:</span>
                    {isEditing ? (
                      <select
                        value={formData.marital_status || 'Single'}
                        onChange={(e) => handleChange('marital_status', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                      >
                        <option>Single</option>
                        <option>Married</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      <span className="font-bold text-slate-800">{formData.marital_status || 'Single'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Nationality:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.nationality || ''}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{formData.nationality || 'Indian'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Personal Email:</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.personal_email || ''}
                        onChange={(e) => handleChange('personal_email', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{formData.personal_email || 'personal@example.com'}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Bank & Government Identifiers</h4>
                  
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Bank Name:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.bank_name || ''}
                        onChange={(e) => handleChange('bank_name', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{formData.bank_name || 'HDFC Bank'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Account Number:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.bank_account_no || ''}
                        onChange={(e) => handleChange('bank_account_no', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-mono font-bold text-slate-800">{formData.bank_account_no || '50100234567890'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">IFSC Code:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.ifsc_code || ''}
                        onChange={(e) => handleChange('ifsc_code', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-mono font-bold text-slate-800">{formData.ifsc_code || 'HDFC0001234'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">PAN Number:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.pan_no || ''}
                        onChange={(e) => handleChange('pan_no', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-mono font-bold text-slate-800">{formData.pan_no || 'ABCDE1234F'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">UAN Number:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.uan_no || ''}
                        onChange={(e) => handleChange('uan_no', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-right"
                      />
                    ) : (
                      <span className="font-mono font-bold text-slate-800">{formData.uan_no || '100908070605'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Residing Address</h4>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.residing_address || ''}
                    onChange={(e) => handleChange('residing_address', e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                ) : (
                  <p className="text-slate-700 font-medium">{formData.residing_address || '123 Tech Park Road, Chennai, Tamil Nadu - 600001'}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SALARY INFO (ADMIN-ONLY) */}
          {activeTab === 'salary' && canSeeSalaryInfo && (
            <div className="space-y-6">
              <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-center space-x-2 text-xs text-amber-800">
                <Shield className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Confidential: Salary Info is restricted to Admin role. Auto-calculated based on defined Wage.</span>
                <button
                  onClick={() => setShowPayslip(true)}
                  className="ml-auto inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>View Payslip</span>
                </button>
              </div>

              {/* Wage Config Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Wage (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.monthly_wage || formData.wage || 50000}
                      onChange={(e) => handleChange('monthly_wage', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  ) : (
                    <p className="text-xl font-extrabold text-slate-900">₹{monthlyWage.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Yearly Wage (CTC)</label>
                  <p className="text-xl font-extrabold text-indigo-600">₹{yearlyWage.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Days & Break</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Days/wk"
                        value={formData.working_days_per_week || 5}
                        onChange={(e) => handleChange('working_days_per_week', Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Break hrs"
                        value={formData.break_hours || 1.0}
                        onChange={(e) => handleChange('break_hours', Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">{workingDaysPerWeek} Days/Week • {breakHours} hr Break</p>
                  )}
                </div>
              </div>

              {/* Salary Components Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left divide-y divide-slate-100">
                  <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Component</th>
                      <th className="py-3 px-4">Computation Basis</th>
                      <th className="py-3 px-4 text-right">Amount (₹ / Month)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">Basic Salary</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={basicPercent}
                              onChange={(e) => handleChange('basic_percent', Number(e.target.value))}
                              className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                            />
                            <span>% of Monthly Wage</span>
                          </div>
                        ) : (
                          `${basicPercent}% of Monthly Wage`
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{basic.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">House Rent Allowance (HRA)</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={hraPercent}
                              onChange={(e) => handleChange('hra_percent', Number(e.target.value))}
                              className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                            />
                            <span>% of Basic Salary</span>
                          </div>
                        ) : (
                          `${hraPercent}% of Basic Salary`
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{hra.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">Standard Allowance</td>
                      <td className="py-2.5 px-4 text-slate-500">16.67% of Wage</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{stdAllowance.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">Performance Bonus</td>
                      <td className="py-2.5 px-4 text-slate-500">8.33% of Basic Salary</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{bonus.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">Leave Travel Allowance (LTA)</td>
                      <td className="py-2.5 px-4 text-slate-500">8.33% of Basic Salary</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{lta.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-800">Fixed Allowance</td>
                      <td className="py-2.5 px-4 text-slate-500">Remainder (Wage − Components)</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{fixedAllowance.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="py-3 px-4 text-indigo-700">Gross Monthly Earnings</td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right text-indigo-700 text-sm">₹{monthlyWage.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions: PF & Tax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Provident Fund (PF) Contribution</h4>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Employee Contribution ({pfPercent}% Basic):</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={pfPercent}
                          onChange={(e) => handleChange('pf_percent', Number(e.target.value))}
                          className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-800">₹{pfEmployee.toLocaleString()} / mo</span>
                    )}
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Employer Contribution ({pfPercent}% Basic):</span>
                    <span className="font-bold text-slate-800">₹{pfEmployer.toLocaleString()} / mo</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Tax Deductions</h4>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Professional Tax:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span>₹</span>
                        <input
                          type="number"
                          value={profTax}
                          onChange={(e) => handleChange('professional_tax', Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-slate-800">₹{profTax.toLocaleString()} / mo</span>
                    )}
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200 pt-2 font-bold text-rose-600">
                    <span>Total Monthly Deductions:</span>
                    <span>₹{(pfEmployee + profTax).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY (OWN PROFILE) */}
          {activeTab === 'security' && isOwnProfile && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-indigo-600" />
                  <span>Change Password</span>
                </h4>

                {passwordMsg && <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl">{passwordMsg}</div>}
                {passwordError && <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl">{passwordError}</div>}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPw ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 pr-10 bg-white border border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPw(!showOldPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 pr-10 bg-white border border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 pr-10 bg-white border border-slate-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {showPayslip && (
        <PayslipModal
          employee={employee}
          onClose={() => setShowPayslip(false)}
        />
      )}
    </div>
  );
}
