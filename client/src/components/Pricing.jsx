import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaArrowRight, FaRegStar, FaTag } from 'react-icons/fa';
import '../styles/pricing.scss';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const handleGetPro = () => {
    navigate('/get-pro');
  };

  const pricingPlans = [
    {
      name: 'Free',
      description: 'Perfect for small businesses and individuals just getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: 'Basic inventory tracking', included: true },
        { name: 'Up to 100 stock items', included: true },
        { name: 'Single user account', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Email support', included: true },
        { name: 'Mobile app access', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false },
        { name: 'Multiple users', included: false },
        { name: 'Priority support', included: false }
      ],
      popular: false,
      buttonText: 'Start for Free',
      buttonClass: 'secondary'
    },
    {
      name: 'Pro',
      description: 'For growing businesses that need more power and flexibility',
      monthlyPrice: 9.99,
      annualPrice:  9.99,
      features: [
        { name: 'Advanced inventory tracking', included: true },
        { name: 'Unlimited stock items', included: true },
        { name: 'Multiple user accounts', included: true },
        { name: 'Advanced reporting & insights', included: true },
        { name: 'Priority email & chat support', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Advanced analytics dashboard', included: true },
        { name: 'API access', included: true },
        { name: 'Up to 10 team members', included: true },
        { name: '24/7 phone support', included: true }
      ],
      popular: true,
      buttonText: 'Get Started',
      buttonClass: 'primary',
      savingText: 'Save 20%'
    }
  ];

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that fits your business needs</p>
          
          <div className="pricing-toggle">
            <span className={!isAnnual ? 'active' : ''}>Monthly</span>
            <div 
              className={`toggle-switch ${isAnnual ? 'annual' : 'monthly'}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="toggle-knob"></div>
            </div>
            <span className={isAnnual ? 'active' : ''}>Annual</span>
            <div className="pricing-badge">Save 20%</div>
          </div>
        </div>

        <div className="pricing-plans">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-plan ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <FaRegStar />
                  <span>Most Popular</span>
                </div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                {(plan.monthlyPrice > 0 || plan.annualPrice > 0) && (
                  <span className="period">/ {isAnnual ? 'mo (billed annually)' : 'month'}</span>
                )}
                {isAnnual && plan.annualPrice < plan.monthlyPrice && (
                  <div className="saving-tag">
                    <FaTag />
                    <span>{plan.savingText}</span>
                  </div>
                )}
              </div>
              
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={feature.included ? 'included' : 'excluded'}>
                    <span className="feature-icon">
                      {feature.included ? <FaCheck /> : <FaTimes />}
                    </span>
                    <span className="feature-text">{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className="plan-footer">
                <button 
                  className={`${plan.buttonClass}-btn`}
                  onClick={handleGetPro}
                >
                  {plan.buttonText}
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pricing-guarantee">
          <p>All plans come with a 14-day free trial. No credit card required.</p>
          <p className="guarantee-note">100% satisfaction guarantee. Cancel anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;