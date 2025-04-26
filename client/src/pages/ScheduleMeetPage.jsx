import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Users, Mail, MessageSquare, CheckCircle, Info } from 'lucide-react';
import Card, { CardBody, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';

const ScheduleMeetPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    lawyerId: '',
    date: '',
    time: '',
    details: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Sample lawyers data
  const lawyers = [
    {
      id: '1',
      name: 'Jennifer Robinson',
      image: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=300',
      specialty: 'Family Law',
      experience: '15 years',
      bio: 'Specializing in divorce, child custody, and family mediation with a compassionate approach to sensitive family matters.'
    },
    {
      id: '2',
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=300', 
      specialty: 'Business Law',
      experience: '12 years',
      bio: 'Expert in business formation, contracts, and corporate compliance with experience serving startups and established companies.'
    },
    {
      id: '3',
      name: 'David Washington',
      image: 'https://images.pexels.com/photos/5076531/pexels-photo-5076531.jpeg?auto=compress&cs=tinysrgb&w=300',
      specialty: 'Criminal Defense',
      experience: '20 years',
      bio: 'Former prosecutor now defending clients in all types of criminal cases, from misdemeanors to serious felony charges.'
    },
    {
      id: '4',
      name: 'Sarah Patel',
      image: 'https://images.pexels.com/photos/7634677/pexels-photo-7634677.jpeg?auto=compress&cs=tinysrgb&w=300',
      specialty: 'Immigration Law',
      experience: '10 years',
      bio: 'Dedicated to helping individuals and families navigate the complex U.S. immigration system and achieve their immigration goals.'
    }
  ];

  // Sample available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  // Sample available time slots
  const availableTimes = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLawyerSelect = (lawyerId) => {
    setFormData({
      ...formData,
      lawyerId
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.lawyerId) newErrors.lawyerId = 'Please select a lawyer';
    } else if (step === 3) {
      if (!formData.date) newErrors.date = 'Please select a date';
      if (!formData.time) newErrors.time = 'Please select a time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setErrors({
        ...errors,
        agreeToTerms: 'You must agree to the terms and conditions'
      });
      return;
    }
    
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsComplete(true);
      }, 1500);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step < currentStep 
                ? 'bg-blue-800 border-blue-800' 
                : step === currentStep 
                  ? 'border-blue-800 text-blue-800' 
                  : 'border-gray-300 text-gray-400'
            }`}>
              {step < currentStep ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <span className={`text-sm font-semibold ${step === currentStep ? 'text-blue-800' : 'text-gray-400'}`}>
                  {step}
                </span>
              )}
            </div>
            
            {step < 4 && (
              <div className={`w-12 h-1 ${step < currentStep ? 'bg-blue-800' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStepTitle = () => {
    const titles = [
      'Personal Information',
      'Select a Lawyer',
      'Choose Date & Time',
      'Review & Confirm'
    ];
    
    return (
      <h2 className="text-2xl font-bold text-center mb-6">
        {titles[currentStep - 1]}
      </h2>
    );
  };

  const renderStep1 = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John"
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="john.doe@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="(123) 456-7890"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Briefly describe your legal matter:</h3>
          <textarea
            id="details"
            name="details"
            rows={4}
            value={formData.details}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
            placeholder="Please provide some details about your legal issue to help us prepare for your consultation."
          ></textarea>
        </div>
      </>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lawyers.map(lawyer => (
          <Card 
            key={lawyer.id}
            className={`cursor-pointer transition-all ${
              formData.lawyerId === lawyer.id 
                ? 'ring-2 ring-blue-500 transform scale-[1.02]' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleLawyerSelect(lawyer.id)}
          >
            <CardBody className="flex flex-col items-center sm:flex-row sm:items-start">
              <img 
                src={lawyer.image} 
                alt={lawyer.name}
                className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 sm:mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">{lawyer.name}</h3>
                <p className="text-blue-800 font-medium">{lawyer.specialty}</p>
                <p className="text-sm text-gray-500">{lawyer.experience} experience</p>
                <p className="text-sm text-gray-600 mt-2">{lawyer.bio}</p>
                {formData.lawyerId === lawyer.id && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
        
        {errors.lawyerId && (
          <p className="text-sm text-red-500 col-span-full">{errors.lawyerId}</p>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-800" />
            Select a Date
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableDates.map(date => {
              const dateObj = new Date(date);
              const formattedDate = format(dateObj, 'MMM d');
              const dayOfWeek = format(dateObj, 'EEE');
              
              return (
                <div
                  key={date}
                  className={`p-3 border rounded-md text-center cursor-pointer transition-colors ${
                    formData.date === date 
                      ? 'bg-blue-100 border-blue-500 text-blue-800' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handleInputChange({ target: { name: 'date', value: date } })}
                >
                  <div className="text-xs text-gray-500">{dayOfWeek}</div>
                  <div className="font-medium">{formattedDate}</div>
                </div>
              );
            })}
          </div>
          
          {errors.date && (
            <p className="mt-2 text-sm text-red-500">{errors.date}</p>
          )}
        </div>
        
        {/* Time Selection */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-800" />
            Select a Time
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map(time => {
              // Format time from 24h to 12h
              const [hours, minutes] = time.split(':');
              const hour = parseInt(hours, 10);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              const formattedTime = `${hour12}:${minutes} ${ampm}`;
              
              return (
                <div
                  key={time}
                  className={`p-3 border rounded-md text-center cursor-pointer transition-colors ${
                    formData.time === time 
                      ? 'bg-blue-100 border-blue-500 text-blue-800' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => handleInputChange({ target: { name: 'time', value: time } })}
                >
                  {formattedTime}
                </div>
              );
            })}
          </div>
          
          {errors.time && (
            <p className="mt-2 text-sm text-red-500">{errors.time}</p>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const selectedLawyer = lawyers.find(lawyer => lawyer.id === formData.lawyerId);
    
    // Format date for display
    let formattedDate = '';
    if (formData.date) {
      const dateObj = new Date(formData.date);
      formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');
    }
    
    // Format time for display
    let formattedTime = '';
    if (formData.time) {
      const [hours, minutes] = formData.time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      formattedTime = `${hour12}:${minutes} ${ampm}`;
    }
    
    return (
      <div>
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <Info className="flex-shrink-0 w-5 h-5 mr-3 mt-0.5 text-blue-800" />
          <p className="text-sm text-gray-700">
            Please review your consultation details before confirming. You will receive a confirmation email with the Google Meet link once your appointment is scheduled.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-800" />
                Personal Information
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Appointment Details */}
          <Card>
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-800" />
                Appointment Details
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Lawyer</p>
                  <p className="font-medium">{selectedLawyer?.name} - {selectedLawyer?.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{formattedTime}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Legal Matter Details */}
        {formData.details && (
          <Card className="mt-6">
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-800" />
                Legal Matter Details
              </h3>
            </CardHeader>
            <CardBody>
              <p>{formData.details}</p>
            </CardBody>
          </Card>
        )}
        
        {/* Terms and Conditions */}
        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                I agree to the terms and conditions
              </label>
              <p className="text-gray-500">
                By scheduling this consultation, you agree that this does not establish an attorney-client relationship until formally engaged in writing.
              </p>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionStep = () => {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Consultation Scheduled!</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Your consultation has been successfully scheduled. We've sent a confirmation email with your Google Meet link and appointment details.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-700 text-left space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-800 mt-1 mr-2 flex-shrink-0" />
              Check your email for appointment details and Google Meet link
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-800 mt-1 mr-2 flex-shrink-0" />
              Add the appointment to your calendar
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-800 mt-1 mr-2 flex-shrink-0" />
              Prepare any relevant documents or questions for your consultation
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-800 mt-1 mr-2 flex-shrink-0" />
              Join the Google Meet link at your scheduled time
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">
            Return to Home
          </Button>
          <Button variant="outline">
            Visit Legal Resources
          </Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (isComplete) {
      return renderCompletionStep();
    }
    
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    if (isComplete) {
      return null;
    }
    
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={goToPreviousStep}
          >
            Back
          </Button>
        ) : (
          <div></div>  // Placeholder for flex spacing
        )}
        
        {currentStep < 4 ? (
          <Button
            variant="primary"
            onClick={goToNextStep}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-800 py-20 px-4">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Schedule a Consultation</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Book a virtual meeting with one of our experienced attorneys to discuss your legal needs.
          </p>
        </div>
      </div>

      {/* Scheduling Form */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardBody>
                {renderStepIndicator()}
                {renderStepTitle()}
                {renderStepContent()}
                {renderStepNavigation()}
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {!isComplete && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {[
                  {
                    q: "How long are the consultation sessions?",
                    a: "Initial consultations are typically 30 minutes long. If more time is needed, your attorney will discuss options at the end of your session."
                  },
                  {
                    q: "How does the virtual meeting work?",
                    a: "We use Google Meet for our virtual consultations. After scheduling, you'll receive an email with a link to join your meeting at the appointed time. No downloads are required - you can join directly from your browser."
                  },
                  {
                    q: "What should I prepare for my consultation?",
                    a: "It's helpful to have a brief summary of your legal issue and any relevant documents ready to share. Your attorney may request specific documents depending on your case."
                  },
                  {
                    q: "Can I reschedule my appointment?",
                    a: "Yes, you can reschedule through the link in your confirmation email or by calling our office. We request 24 hours' notice for any changes."
                  }
                ].map((faq, index) => (
                  <Card key={index}>
                    <CardBody>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-600">{faq.a}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ScheduleMeetPage;