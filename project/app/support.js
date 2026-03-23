// Support Page Functionality
console.log('[Support] Support page loaded');

// Modal Management
const modals = {
  doc: document.getElementById('docModal'),
  help: document.getElementById('helpModal'),
  report: document.getElementById('reportModal'),
  contact: document.getElementById('contactModal'),
};

const cards = {
  doc: document.getElementById('docCard'),
  help: document.getElementById('helpCard'),
  report: document.getElementById('reportCard'),
  contact: document.getElementById('contactCard'),
};

// Open modal function
function openModal(modalKey) {
  console.log(`[Support] Opening ${modalKey} modal`);
  if (modals[modalKey]) {
    modals[modalKey].classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close modal function
function closeModal(modalKey) {
  console.log(`[Support] Closing ${modalKey} modal`);
  if (modals[modalKey]) {
    modals[modalKey].classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close all modals
function closeAllModals() {
  Object.keys(modals).forEach((key) => {
    modals[key].classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

// Card click handlers
cards.doc.addEventListener('click', () => openModal('doc'));
cards.help.addEventListener('click', () => openModal('help'));
cards.report.addEventListener('click', () => openModal('report'));
cards.contact.addEventListener('click', () => openModal('contact'));

// Close modal button handlers
document.querySelectorAll('.modal-close').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

// Close modal on background click
Object.values(modals).forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

// Report Issue Form Handler
const reportForm = document.getElementById('reportForm');
if (reportForm) {
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[Support] Submitting report issue form');

    const formData = {
      type: document.getElementById('issueType').value,
      priority: document.getElementById('issuePriority').value,
      subject: document.getElementById('issueSubject').value,
      details: document.getElementById('issueDetails').value,
      device: document.getElementById('issueDevice').value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.log('[Support] Report form data:', formData);

    try {
      // Store locally or send to backend
      const existingReports = JSON.parse(localStorage.getItem('supportReports') || '[]');
      existingReports.push(formData);
      localStorage.setItem('supportReports', JSON.stringify(existingReports));

      console.log('[Support] Report saved successfully');

      // Show success message
      alert('Thank you! Your issue report has been submitted.\nReference: #IssueReport-' + Date.now());

      // Reset form
      reportForm.reset();

      // Close modal
      closeModal('report');
    } catch (error) {
      console.error('[Support] Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  });
}

// Contact Us Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[Support] Submitting contact form');

    const formData = {
      name: document.getElementById('contactName').value,
      email: document.getElementById('contactEmail').value,
      method: document.getElementById('contactMethod').value,
      message: document.getElementById('contactMessage').value,
      timestamp: new Date().toISOString(),
    };

    console.log('[Support] Contact form data:', formData);

    try {
      // Store locally or send to backend
      const existingContacts = JSON.parse(localStorage.getItem('supportContacts') || '[]');
      existingContacts.push(formData);
      localStorage.setItem('supportContacts', JSON.stringify(existingContacts));

      console.log('[Support] Contact message saved successfully');

      // Show success message
      alert(`Thank you ${formData.name}! We've received your message.\nWe'll get back to you via ${formData.method} shortly.`);

      // Reset form
      contactForm.reset();

      // Close modal
      closeModal('contact');
    } catch (error) {
      console.error('[Support] Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    }
  });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// Accordion Functionality for Help Center
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Support] Initializing accordion functionality');
  
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      const accordionBody = accordionItem.querySelector('.accordion-body');
      const isActive = header.classList.contains('active');
      
      // Close all other accordions in the same parent
      const sameParent = header.closest('.accordion');
      sameParent.querySelectorAll('.accordion-header').forEach((h) => {
        if (h !== header) {
          h.classList.remove('active');
          h.parentElement.querySelector('.accordion-body').classList.remove('active');
        }
      });
      
      // Toggle current accordion
      if (isActive) {
        header.classList.remove('active');
        accordionBody.classList.remove('active');
        console.log('[Support] Accordion closed');
      } else {
        header.classList.add('active');
        accordionBody.classList.add('active');
        console.log('[Support] Accordion opened');
      }
    });
  });
});

console.log('[Support] All event handlers attached successfully');

