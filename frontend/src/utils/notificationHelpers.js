// Notification helper utilities
// Use these functions to trigger notifications throughout the app

export const NotificationTypes = {
    REGISTRATION: 'registration',
    APPROVAL: 'approval',
    DECLINE: 'decline',
    ATTENDANCE: 'attendance',
    MESSAGE: 'message',
    ADMIN_CREATED: 'admin_created',
    STUDENT_UPDATED: 'student_updated',
    STUDENT_DELETED: 'student_deleted'
};

export const NotificationTargets = {
    ALL: 'all',
    MANAGER: 'manager',
    ADMIN: 'admin'
};

// Helper to create notification messages
export const createNotificationMessage = {
    studentRegistered: (studentName, section) => ({
        type: NotificationTypes.REGISTRATION,
        message: `New student registered: ${studentName}`,
        target: section, // Target specific section admin
        metadata: { section, studentName }
    }),

    studentApproved: (studentName, adminName) => ({
        type: NotificationTypes.APPROVAL,
        message: `${adminName} approved student: ${studentName}`,
        target: NotificationTargets.MANAGER, // Only manager sees this
        metadata: { studentName, adminName }
    }),

    studentDeclined: (studentName, adminName, reason) => ({
        type: NotificationTypes.DECLINE,
        message: `${adminName} declined student: ${studentName}${reason ? ` - Reason: ${reason}` : ''}`,
        target: NotificationTargets.MANAGER, // Only manager sees this
        metadata: { studentName, adminName, reason }
    }),

    attendanceSaved: (adminName, section, count) => ({
        type: NotificationTypes.ATTENDANCE,
        message: `${adminName} saved attendance for ${count} students in ${section} section`,
        target: NotificationTargets.MANAGER, // Only manager sees this
        metadata: { adminName, section, count }
    }),

    studentUpdated: (studentName, updatedBy) => ({
        type: NotificationTypes.STUDENT_UPDATED,
        message: `${updatedBy} updated student information: ${studentName}`,
        target: NotificationTargets.MANAGER,
        metadata: { studentName, updatedBy }
    })
};
