const socket = io();

// Get token from localStorage
const token = localStorage.getItem('token');

if (token) {
  // Fetch user info to get userId
  fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data._id) {
        const userId = data._id;
        socket.emit('register', userId); // Register user with backend WebSocket
        console.log('Registered with socket server:', userId);

        // Listen for earning notifications
        socket.on('earning', (payload) => {
          // elegant notification
          showEarningNotification(payload);

          // refresh dashboard data
          refreshDashboardData();
        });
      }
    })
    .catch(err => console.error('Failed to register for socket:', err));
}

function showEarningNotification(payload) {
  // Create a custom notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-family: Arial, sans-serif;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">🎉 New Earning!</div>
    <div>₹${payload.amount} from ${payload.from}</div>
    <div style="font-size: 12px; opacity: 0.9;">Level ${payload.level} referral</div>
  `;

  document.body.appendChild(notification);

  // Add slide-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);

  // Also show browser notification if permission granted
  if (Notification.permission === 'granted') {
    new Notification('New Referral Earning!', {
      body: `You earned ₹${payload.amount} from ${payload.from} (Level ${payload.level})`,
      icon: '/favicon.ico'
    });
  }
}

// Function to refresh dashboard data
async function refreshDashboardData() {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  try {
    const response = await fetch('/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to refresh dashboard data');
    }

    const data = await response.json();

    // Update earnings display if elements exist
    const totalEarningsElement = document.getElementById('totalEarnings');
    const level1EarningsElement = document.getElementById('level1Earnings');
    const level2EarningsElement = document.getElementById('level2Earnings');
    const earningsSection = document.querySelector('.earnings');

    // Add highlight animation to earnings section
    if (earningsSection) {
      earningsSection.classList.add('earnings-highlight');
      setTimeout(() => {
        earningsSection.classList.remove('earnings-highlight');
      }, 600);
    }

    if (totalEarningsElement) {
      // Store old value to show the difference
      const oldValue = parseInt(totalEarningsElement.textContent) || 0;
      const newValue = data.earnings.total || 0;

      // Add a subtle animation to show the update
      totalEarningsElement.style.transition = 'all 0.3s ease';
      totalEarningsElement.style.transform = 'scale(1.1)';
      totalEarningsElement.style.color = '#28a745';
      totalEarningsElement.style.fontWeight = 'bold';

      // Update the value
      totalEarningsElement.textContent = newValue;

      // Show difference if there's an increase
      if (newValue > oldValue) {
        const difference = newValue - oldValue;
        const diffElement = document.createElement('span');
        diffElement.style.cssText = `
          color: #28a745;
          font-size: 12px;
          margin-left: 8px;
          font-weight: normal;
          animation: fadeInOut 3s ease-in-out;
        `;
        diffElement.textContent = `(+₹${difference})`;
        totalEarningsElement.parentNode.appendChild(diffElement);

        // Remove difference indicator after 3 seconds
        setTimeout(() => {
          if (diffElement.parentNode) {
            diffElement.parentNode.removeChild(diffElement);
          }
        }, 3000);
      }

      // Reset animation after a moment
      setTimeout(() => {
        totalEarningsElement.style.transform = 'scale(1)';
        totalEarningsElement.style.color = '';
        totalEarningsElement.style.fontWeight = '';
      }, 500);
    }

    if (level1EarningsElement) {
      level1EarningsElement.textContent = data.earnings.level1Earnings || 0;
    }

    if (level2EarningsElement) {
      level2EarningsElement.textContent = data.earnings.level2Earnings || 0;
    }

    // Update referrals if needed
    const referralsList = document.getElementById('referralsList');
    const referralsTitle = document.getElementById('referralsTitle');

    if (referralsList && referralsTitle && data.referrals) {
      if (data.referrals.length > 0) {
        referralsTitle.textContent = `👥 Your Referrals (${data.referrals.length})`;
        referralsList.innerHTML = '<ul>' +
          data.referrals.map(r =>
            `<li>${r.name} — ${r.email} (Code: ${r.referralCode})</li>`
          ).join('') +
          '</ul>';
      }
    }

    console.log('✅ Dashboard data refreshed successfully');

  } catch (err) {
    console.error('❌ Error refreshing dashboard data:', err);
  }
}
