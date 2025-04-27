import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Briefcase, Calendar as CalendarIcon, ArrowRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const ScheduleMeetPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    caseDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Configure axios with credentials
  const axiosInstance = axios.create({
    withCredentials: true
  });
  
  // Sample available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return format(date, 'yyyy-MM-dd');
  });
  
  // Sample available time slots
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  // Fetch user data from /find-user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/find-user', { withCredentials: true });
        setUserData(response.data);

        if (response.data) {
          setFormData(prevData => ({
            ...prevData,
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Fetch lawyers from /user and filter by role
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/users', { withCredentials: true });
        
        const lawyerUsers = response.data.filter(user => user.role === 'lawyer');
        setLawyers(lawyerUsers);
      } catch (err) {
        setError(err.message || 'Failed to fetch lawyers');
        console.error('Error fetching lawyers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // You can replace this with actual API call to save the booking
      // const response = await axiosInstance.post('/bookings', {
      //   lawyerId: selectedLawyer,
      //   date: selectedDate,
      //   time: selectedTime,
      //   ...formData
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingComplete(true);
    } catch (err) {
      console.error('Error submitting booking:', err);
      // Handle booking error - perhaps show an error message
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  const getSelectedLawyerInfo = () => {
    return lawyers.find(lawyer => lawyer.id === selectedLawyer);
  };
  
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-primary-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-accent-500" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Schedule a Consultation</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Book a virtual meeting with one of our qualified attorneys
          </p>
        </div>
      </section>
      
      {/* Booking Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading available attorneys...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>Error: {error}</p>
                  <p>Please try refreshing the page.</p>
                </div>
              </div>
            ) : !bookingComplete ? (
              <>
                {/* Steps Indicator */}
                <div className="mb-10">
                  <div className="flex items-center justify-center">
                    {[1, 2, 3, 4].map((step) => (
                      <React.Fragment key={step}>
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          currentStep >= step 
                            ? 'bg-primary-600 border-primary-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {currentStep > step ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{step}</span>
                          )}
                        </div>
                        
                        {step < 4 && (
                          <div className={`w-20 h-1 ${
                            currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-2 px-6">
                    <div className="text-center w-20">
                      <span className={`text-sm ${currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                        Select Lawyer
                      </span>
                    </div>
                    <div className="text-center w-20">
                      <span className={`text-sm ${currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                        Date & Time
                      </span>
                    </div>
                    <div className="text-center w-20">
                      <span className={`text-sm ${currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                        Your Details
                      </span>
                    </div>
                    <div className="text-center w-20">
                      <span className={`text-sm ${currentStep >= 4 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                        Confirm
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Step 1: Select Lawyer */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl font-bold mb-6">Select an Attorney</h2>
                    <p className="text-gray-600 mb-6">
                      Choose a lawyer who specializes in your legal matter
                    </p>
                    
                    {lawyers.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No attorneys are currently available.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {lawyers.map((lawyer) => (
                          <div 
                            key={lawyer.id}
                            className={`card cursor-pointer transition-all p-4 rounded-lg ${
                              selectedLawyer === lawyer.id 
                                ? 'border-2 border-primary-500 shadow-md' 
                                : 'hover:shadow-md border border-gray-100'
                            }`}
                            onClick={() => setSelectedLawyer(lawyer.id)}
                          >
                            <div className="flex items-center">
                              <img 
                                src={lawyer.imageUrl || '/api/placeholder/64/64'} 
                                alt={lawyer.name} 
                                className="w-16 h-16 rounded-full object-cover mr-4"
                              />
                              <div>
                                <h3 className="font-serif text-lg font-bold">{lawyer.name || `${lawyer.firstName} ${lawyer.lastName}`}</h3>
                                <p className="text-gray-600">{lawyer.specialization || lawyer.expertise || 'Legal Consultant'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                        disabled={!selectedLawyer || lawyers.length === 0}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Choose Date & Time */}
                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl font-bold mb-6">Select Date and Time</h2>
                    <p className="text-gray-600 mb-6">
                      Choose a convenient date and time for your virtual consultation
                    </p>
                    
                    <div className="mb-8">
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                        Available Dates
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {availableDates.map((date) => (
                          <button
                            key={date}
                            className={`p-3 border rounded-md text-center transition-all ${
                              selectedDate === date
                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            {format(new Date(date), 'MMM d')}
                            <div className="text-xs">
                              {format(new Date(date), 'EEEE')}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {selectedDate && (
                        <>
                          <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-primary-600" />
                            Available Times
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {availableTimeSlots.map((time) => (
                              <button
                                key={time}
                                className={`p-3 border rounded-md text-center transition-all ${
                                  selectedTime === time
                                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                                    : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <button 
                        className="btn btn-outline"
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                        disabled={!selectedDate || !selectedTime}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Your Details */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl font-bold mb-6">Your Details</h2>
                    <p className="text-gray-600 mb-6">
                      Please provide your contact information and brief details about your case
                    </p>
                    
                    <form className="mb-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                          <label htmlFor="firstName" className="form-label">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="form-input"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName" className="form-label">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="form-input"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="caseDetails" className="form-label">
                          Brief Description of Your Case
                        </label>
                        <textarea
                          id="caseDetails"
                          name="caseDetails"
                          rows={4}
                          className="form-input"
                          value={formData.caseDetails}
                          onChange={handleInputChange}
                          placeholder="Please provide a brief summary of your legal matter to help the attorney prepare for your consultation."
                          required
                        ></textarea>
                      </div>
                    </form>
                    
                    <div className="flex justify-between">
                      <button 
                        className="btn btn-outline"
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                        disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                      >
                        Review Booking <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl font-bold mb-6">Review and Confirm</h2>
                    <p className="text-gray-600 mb-6">
                      Please review your booking details before confirming your consultation
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                        <img 
                          src={getSelectedLawyerInfo()?.imageUrl || '/api/placeholder/64/64'} 
                          alt={getSelectedLawyerInfo()?.name || `${getSelectedLawyerInfo()?.firstName} ${getSelectedLawyerInfo()?.lastName}`} 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-serif text-lg font-bold">
                            {getSelectedLawyerInfo()?.name || `${getSelectedLawyerInfo()?.firstName} ${getSelectedLawyerInfo()?.lastName}`}
                          </h3>
                          <p className="text-gray-600">
                            {getSelectedLawyerInfo()?.specialization || getSelectedLawyerInfo()?.expertise || 'Legal Consultant'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                            Appointment Details
                          </h4>
                          <ul className="space-y-2 text-gray-600">
                            <li><strong>Date:</strong> {formatDate(selectedDate)}</li>
                            <li><strong>Time:</strong> {selectedTime}</li>
                            <li><strong>Format:</strong> Google Meet (link will be sent via email)</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <User className="h-5 w-5 mr-2 text-primary-600" />
                            Your Information
                          </h4>
                          <ul className="space-y-2 text-gray-600">
                            <li><strong>Name:</strong> {formData.firstName} {formData.lastName}</li>
                            <li><strong>Email:</strong> {formData.email}</li>
                            <li><strong>Phone:</strong> {formData.phone}</li>
                          </ul>
                        </div>
                      </div>
                      
                      {formData.caseDetails && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                            Case Details
                          </h4>
                          <p className="text-gray-600">{formData.caseDetails}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-800 mb-2">What happens next?</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 flex-shrink-0">1</span>
                          <span>You'll receive a confirmation email with your appointment details.</span>
                        </li>
                        <li className="flex">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 flex-shrink-0">2</span>
                          <span>A Google Meet link will be sent to you before your scheduled appointment.</span>
                        </li>
                        <li className="flex">
                          <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 flex-shrink-0">3</span>
                          <span>Join the meeting at the scheduled time to begin your consultation.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-between">
                      <button 
                        className="btn btn-outline"
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                      <button 
                        className={`btn btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="bg-green-100 text-green-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10" />
                </div>
                <h2 className="font-serif text-3xl font-bold mb-4">Booking Confirmed!</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your consultation has been successfully scheduled.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto mb-8">
                  <h3 className="font-medium text-gray-800 mb-4">Appointment Details</h3>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex">
                      <User className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Attorney:</strong> {getSelectedLawyerInfo()?.name || `${getSelectedLawyerInfo()?.firstName} ${getSelectedLawyerInfo()?.lastName}`}
                      </span>
                    </li>
                    <li className="flex">
                      <CalendarIcon className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Date:</strong> {formatDate(selectedDate)}
                      </span>
                    </li>
                    <li className="flex">
                      <Clock className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Time:</strong> {selectedTime}
                      </span>
                    </li>
                  </ul>
                </div>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email to <strong>{formData.email}</strong> with all the details.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <a className="btn btn-primary" href="/">
                    Return to Homepage
                  </a>
                  <a className="btn btn-outline" href="/legal-book">
                    Browse Legal Resources
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScheduleMeetPage;