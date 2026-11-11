/**
 * Professionally written transactional email translations for Crestora Bank.
 * English is the authoritative base; every other language deep-merges over it,
 * so any missing key silently falls back to English.
 *
 * Languages: en, es, fr, pt, de, it, nl, ar, zh, ja, ko, ru
 */

export interface EmailStrings {
  common: {
    dear: string; // "Dear {name},"
    hello: string;
    footerAutomated: string;
    footerRights: string;
    customerSupport: string;
    loginButton: string;
    supportButton: string;
    unauthorized: string;
    messageFromBank: string;
  };
  labels: {
    customer: string;
    referenceNumber: string;
    transactionType: string;
    amount: string;
    currency: string;
    recipientName: string;
    recipientBank: string;
    recipientAccount: string;
    paymentDescription: string;
    dateTime: string;
    currentStatus: string;
    availableBalance: string;
    transactionSummary: string;
    conversionSummary: string;
    senderAmount: string;
    recipientCurrency: string;
    exchangeRate: string;
    transferFee: string;
    estRecipientAmount: string;
    rateAppliedOn: string;
    newBalance: string;
    transactionDetails: string;
    time: string;
    device: string;
    webBrowser: string;
    reason: string;
    accountNumberLabel: string;
    cardEndingIn: string;
    reviewDetails: string;
    reviewStatus: string;
    reviewCaseId: string;
    holdReason: string;
    estReviewTime: string;
    transactionReference: string;
  };
  status: {
    pending: string;
    approved: string;
    completed: string;
    failed: string;
    onHold: string;
    reversed: string;
    inProgressUnderReview: string;
  };
  txTypes: {
    transfer: string;
    internationalTransfer: string;
    deposit: string;
    withdrawal: string;
    funding: string;
  };
  transferStatus: {
    approvedSubject: string;
    approvedHeadline: string;
    approvedBody: string;
    completedSubject: string;
    completedHeadline: string;
    completedBody: string;
    failedSubject: string;
    failedHeadline: string;
    failedBody: string;
    reversedSubject: string;
    reversedHeadline: string;
    reversedBody: string;
    genericSubject: string;
    genericHeadline: string;
    genericBody: string; // "Your transfer status has been updated to: {status}."
    processingSubject: string;
    processingHeadline: string;
    processingBody: string;
    vatRequiredSubject: string;
    vatRequiredHeadline: string;
    vatRequiredBody: string;
    imfRequiredSubject: string;
    imfRequiredHeadline: string;
    imfRequiredBody: string;
    codeVerifiedSubject: string;
    codeVerifiedHeadline: string;
    codeVerifiedBody: string; // "{codeType} code verified..."
  };
  onHold: {
    subject: string;
    headline: string;
    intro: string;
    teamName: string;
    teamDivision: string;
    whatHappensNext: string;
    whatHappensNextBody: string;
    whatYouNeedToDo: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  transferPending: {
    subject: string;
    headline: string;
    body: string;
    stagesNote: string;
  };
  deposit: {
    subject: string;
    headline: string;
    body: string;
  };
  withdrawal: {
    subject: string;
    headline: string;
    body: string;
  };
  registration: {
    receivedSubject: string;
    receivedHeadline: string;
    receivedBody1: string;
    receivedBody2: string; // includes {timeframe}
    approvedSubject: string;
    approvedHeadline: string;
    approvedBody: string;
    approvedAccountLabel: string;
    approvedFooter: string;
  };
  login: {
    subject: string;
    headline: string;
    body: string;
    noAction: string;
  };
  card: {
    subject: string; // includes {cardType}
    headline: string;
    body: string; // includes {cardType}
    footer: string;
  };
  kyc: {
    approvedSubject: string;
    approvedHeadline: string;
    approvedBody: string;
    rejectedSubject: string;
    rejectedHeadline: string;
    rejectedBody: string;
    rejectedFooter: string;
  };
  security: {
    subject: string; // includes {changeType}
    headline: string;
    body: string; // includes {changeType}
    footer: string;
  };
  otp: {
    subject: string;
    intro: string;
    expiry: string;
    ignore: string;
    secureVerification: string;
  };
  passwordReset: {
    subject: string;
    intro: string; // includes {name}
  };
  depositRequest: {
    subject: string;
    headline: string;
    body: string; // includes {depositId}
    reviewNote: string;
    thanks: string;
  };
  accountFunded: {
    subject: string;
    headline: string;
    bodyWithSender: string;
    bodyNoSender: string;
  };
  supportReply: {
    subject: string;
    headline: string;
    intro: string;
    footer: string;
  };
  depositRejected: {
    subject: string;
    headline: string;
    body: string;
    contactSupport: string;
    thanks: string;
  };
  loan: {
    receivedSubject: string;
    receivedHeadline: string;
    receivedBody: string; // includes {reference}
    receivedReviewNote: string;
    approvedSubject: string;
    approvedHeadline: string;
    approvedBody: string; // includes {reference}
    approvedCredited: string; // includes {amount} and {balance}
    declinedSubject: string;
    declinedHeadline: string;
    declinedBody: string; // includes {reference}
    declinedContact: string;
    labels: {
      loanSummary: string;
      loanReference: string;
      category: string;
      personal: string;
      employment: string;
      employer: string;
      workEmail: string;
      loanAmount: string;
      purpose: string;
      term: string;
      months: string;
      interestRate: string;
      estMonthlyPayment: string;
      adminMessage: string;
    };
    thanks: string;
  };
}

const en: EmailStrings = {
  common: {
    dear: "Dear {name},",
    hello: "Hello,",
    footerAutomated: "This is an automated message from Crestora Bank. Please do not reply directly to this email.",
    footerRights: "All rights reserved.",
    customerSupport: "Customer Support",
    loginButton: "Log In to Crestora Bank",
    supportButton: "Contact Customer Support",
    unauthorized: "If you did not authorize this transaction, please contact our support team immediately.",
    messageFromBank: "Message From Crestora Bank",
  },
  labels: {
    customer: "Customer",
    referenceNumber: "Reference Number",
    transactionType: "Transaction Type",
    amount: "Amount",
    currency: "Currency",
    recipientName: "Recipient Name",
    recipientBank: "Recipient Bank",
    recipientAccount: "Recipient Account",
    paymentDescription: "Payment Description",
    dateTime: "Date & Time",
    currentStatus: "Current Status",
    availableBalance: "Available Balance",
    transactionSummary: "Transaction Summary",
    conversionSummary: "Currency Conversion Summary",
    senderAmount: "Sender Amount",
    recipientCurrency: "Recipient Currency",
    exchangeRate: "Exchange Rate",
    transferFee: "Transfer Fee",
    estRecipientAmount: "Estimated Recipient Amount",
    rateAppliedOn: "Rate Applied On",
    newBalance: "New Balance",
    transactionDetails: "Transaction Details",
    time: "Time",
    device: "Device",
    webBrowser: "Web Browser",
    reason: "Reason",
    accountNumberLabel: "Your Account Number",
    cardEndingIn: "Card Number Ending In",
    reviewDetails: "Review Details",
    reviewStatus: "Review Status",
    reviewCaseId: "Review Case ID",
    holdReason: "Hold Reason",
    estReviewTime: "Estimated Review Time",
    transactionReference: "Transaction Reference",
  },
  status: {
    pending: "Pending",
    approved: "Approved",
    completed: "Completed",
    failed: "Failed",
    onHold: "On Hold — Under Review",
    reversed: "Reversed",
    inProgressUnderReview: "In Progress — Under Review",
  },
  txTypes: {
    transfer: "Transfer",
    internationalTransfer: "International Transfer",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    funding: "Account Funding",
  },
  transferStatus: {
    approvedSubject: "Your Transfer Has Been Approved",
    approvedHeadline: "Transfer Approved",
    approvedBody: "Good news! Your transfer has passed our review and has been approved. It is now being processed for delivery to the recipient's bank.",
    completedSubject: "Your Transfer Is Complete",
    completedHeadline: "Transfer Completed",
    completedBody: "Your transfer has been completed successfully. The funds have been delivered to the recipient's bank. Please keep the reference number below for your records.",
    failedSubject: "Your Transfer Could Not Be Completed",
    failedHeadline: "Transfer Failed",
    failedBody: "Unfortunately, your transfer could not be completed. The full amount has been returned to your available balance. No fees were charged. Please contact Customer Support if you need assistance or wish to retry this payment.",
    reversedSubject: "Your Transfer Has Been Reversed",
    reversedHeadline: "Transfer Reversed",
    reversedBody: "Your transfer has been reversed and the full amount has been credited back to your available balance. If you did not request this reversal, please contact Customer Support immediately.",
    genericSubject: "Transfer Update",
    genericHeadline: "Transfer Update",
    genericBody: "Your transfer status has been updated to: {status}.",
    processingSubject: "Your Transfer Is Being Processed",
    processingHeadline: "Transfer Processing",
    processingBody: "Your transfer is currently being processed by our payments team. You will be notified by email as soon as the next stage is reached. No action is required from you at this time.",
    vatRequiredSubject: "Action Required: VAT Clearance Code Needed for Your Transfer",
    vatRequiredHeadline: "VAT Clearance Code Required",
    vatRequiredBody: "Your transfer requires a <strong>VAT (Value Added Tax) Clearance Code</strong> before it can proceed to the next processing stage. This is a standard compliance requirement for this type of transaction. To obtain your VAT Clearance Code, please contact our Customer Support team. Once you have received your code, log in to your account and enter it on the transaction verification screen.",
    imfRequiredSubject: "Action Required: IMF Authorization Code Needed for Your Transfer",
    imfRequiredHeadline: "IMF Authorization Code Required",
    imfRequiredBody: "Your transfer requires an <strong>IMF (International Monetary Fund) Authorization Code</strong> before it can be released for final settlement. This verification step applies to selected international transactions. To obtain your IMF Authorization Code, please contact our Customer Support team. Once you have received your code, log in to your account and enter it on the transaction verification screen.",
    codeVerifiedSubject: "Verification Successful — Your Transfer Is Processing",
    codeVerifiedHeadline: "Code Verified",
    codeVerifiedBody: "Your {codeType} code has been verified successfully. Your transfer has moved to the processing stage and you will be notified by email of any further updates.",
  },
  onHold: {
    subject: "Your Transfer Is Under Review — Crestora Bank ITRT",
    headline: "Transfer Under Review",
    intro: "Your transfer has been temporarily placed under review by Crestora Bank's <strong>International Transfer Review Team (ITRT)</strong> as part of our internal security and compliance procedures. This is a routine step designed to protect your account and ensure your payment is processed safely.",
    teamName: "International Transfer Review Team",
    teamDivision: "Security & Compliance Division — Crestora Bank",
    whatHappensNext: "What Happens Next",
    whatHappensNextBody: "Our review is currently in progress and no immediate action is required unless indicated below. You will automatically receive another email as soon as the review has been completed, or if any additional information is required from you.",
    whatYouNeedToDo: "What You Need To Do",
    step1: "Log in securely to your Crestora Bank account.",
    step2: "Review the transaction details.",
    step3: "Complete any requested verification steps if prompted.",
    step4: "Contact Customer Support if assistance is needed.",
  },
  transferPending: {
    subject: "Your Transfer Has Been Submitted — Crestora Bank",
    headline: "Transfer Submitted",
    body: "We have received your transfer instruction and it is now being processed. Please review the full details of your transaction below and keep the reference number for your records.",
    stagesNote: "You will be notified by email at every stage of this transaction. If you did not authorize this transaction, please contact our support team immediately.",
  },
  deposit: {
    subject: "Deposit Received — Crestora Bank",
    headline: "Deposit Notification",
    body: "A deposit has been credited to your Crestora Bank account. Your updated balance is shown below.",
  },
  withdrawal: {
    subject: "Withdrawal Processed — Crestora Bank",
    headline: "Withdrawal Notification",
    body: "A withdrawal has been processed from your Crestora Bank account. Details are below.",
  },
  registration: {
    receivedSubject: "Your Crestora Bank Account Application",
    receivedHeadline: "Account Application Received",
    receivedBody1: "Thank you for opening an account with Crestora Bank. Your account has been created and is currently under review.",
    receivedBody2: "Please wait for bank approval within <strong>15 minutes to a few hours</strong>. You will receive a confirmation email once your account is approved.",
    approvedSubject: "Your Crestora Bank Account Has Been Approved",
    approvedHeadline: "Account Approved",
    approvedBody: "Congratulations! Your Crestora Bank account has been approved and is now active.",
    approvedAccountLabel: "Your Account Number",
    approvedFooter: "You can now sign in to your online banking dashboard.",
  },
  login: {
    subject: "New Sign-In to Your Crestora Bank Account",
    headline: "Security Alert",
    body: "We detected a new sign-in to your Crestora Bank online banking account.",
    noAction: "If this was you, no action is needed. If you don't recognize this activity, please contact our support team immediately.",
  },
  card: {
    subject: "Your New {cardType} Card is Ready",
    headline: "Card Approved",
    body: "Your request for a new {cardType} card has been approved and generated.",
    footer: "You can view your full card details securely in your online banking dashboard.",
  },
  kyc: {
    approvedSubject: "Your Identity Has Been Verified",
    approvedHeadline: "Identity Verification Approved",
    approvedBody: "Good news! Your identity documents have been successfully verified. Your account limits have been updated accordingly.",
    rejectedSubject: "Action Required: Identity Verification Failed",
    rejectedHeadline: "Identity Verification Failed",
    rejectedBody: "Unfortunately, we could not verify the identity documents you submitted.",
    rejectedFooter: "Please log in to your account and submit new, clear documents.",
  },
  security: {
    subject: "Security Alert: {changeType} Changed",
    headline: "Security Alert",
    body: "This is a confirmation that your <strong>{changeType}</strong> was recently changed.",
    footer: "If you did not make this change, please contact our support team immediately to secure your account.",
  },
  otp: {
    subject: "Your Crestora Bank OTP Code",
    intro: "Your one-time password (OTP) for Crestora Bank account verification is:",
    expiry: "This code will expire in 10 minutes. Do not share this code with anyone.",
    ignore: "If you didn't request this code, please ignore this email.",
    secureVerification: "Secure Verification",
  },
  passwordReset: {
    subject: "Reset Your Crestora Bank Password",
    intro: "Dear {name}, we received a request to reset your Crestora Bank password. Use the verification code below to continue. If you did not request a password reset, please ignore this email or contact support.",
  },
  depositRequest: {
    subject: "Deposit Request Received - Crestora Bank",
    headline: "Deposit Request Received",
    body: "We have received your deposit request (ID: {depositId}) and any associated proof of payment.",
    reviewNote: "Our team is currently reviewing your request. We will notify you once the funds have been credited to your account.",
    thanks: "Thank you for banking with Crestora Bank.",
  },
  accountFunded: {
    subject: "Account Funded",
    headline: "Account Funded",
    bodyWithSender: "Your account has been funded with {amount} from {sender}.",
    bodyNoSender: "Your account has been funded with {amount}.",
  },
  supportReply: {
    subject: "New message from Crestora Bank Support",
    headline: "Support Message",
    intro: "You have received a new message from our Customer Support team:",
    footer: "Log in to your online banking dashboard to continue the conversation.",
  },
  depositRejected: {
    subject: "Deposit Rejected - Crestora Bank",
    headline: "Deposit Rejected",
    body: "Your deposit request (ID: {reference}) for {amount} has been rejected.",
    contactSupport: "If you believe this is an error, please contact our support team.",
    thanks: "Thank you for banking with Crestora Bank.",
  },
  loan: {
    receivedSubject: "Loan Application Received — Crestora Bank",
    receivedHeadline: "Loan Application Received",
    receivedBody: "We have received your loan application (Ref: {reference}). Our credit team will carefully review the details you provided.",
    receivedReviewNote: "You will be notified by email as soon as a decision has been made on your application. No action is required from you at this time.",
    approvedSubject: "Your Loan Has Been Approved — Crestora Bank",
    approvedHeadline: "Loan Approved",
    approvedBody: "Congratulations! Your loan application (Ref: {reference}) has been reviewed and approved by our credit team.",
    approvedCredited: "The loan amount of {amount} has been credited to your account. Your new available balance is {balance}.",
    declinedSubject: "Update on Your Loan Application — Crestora Bank",
    declinedHeadline: "Loan Application Declined",
    declinedBody: "After careful review, we regret to inform you that your loan application (Ref: {reference}) could not be approved at this time.",
    declinedContact: "If you have any questions or would like to discuss alternative options, please contact our Customer Support team.",
    labels: {
      loanSummary: "Loan Application Summary",
      loanReference: "Loan Reference",
      category: "Loan Type",
      personal: "Personal Loan",
      employment: "Employment Loan",
      employer: "Employer",
      workEmail: "Work Email",
      loanAmount: "Loan Amount",
      purpose: "Purpose",
      term: "Term",
      months: "months",
      interestRate: "Interest Rate (APR)",
      estMonthlyPayment: "Est. Monthly Payment",
      adminMessage: "Message from the Bank",
    },
    thanks: "Thank you for banking with Crestora Bank.",
  },
};

/** Deep partial of EmailStrings for non-English languages. */
type PartialStrings = {
  [K in keyof EmailStrings]?: Partial<EmailStrings[K]>;
};

const es: PartialStrings = {
  common: {
    dear: "Estimado/a {name}:",
    hello: "Hola:",
    footerAutomated: "Este es un mensaje automático de Crestora Bank. Por favor, no responda directamente a este correo.",
    footerRights: "Todos los derechos reservados.",
    customerSupport: "Atención al Cliente",
    loginButton: "Iniciar sesión en Crestora Bank",
    supportButton: "Contactar con Atención al Cliente",
    unauthorized: "Si usted no autorizó esta transacción, contacte inmediatamente con nuestro equipo de soporte.",
    messageFromBank: "Mensaje de Crestora Bank",
  },
  labels: {
    customer: "Cliente",
    referenceNumber: "Número de referencia",
    transactionType: "Tipo de transacción",
    amount: "Importe",
    currency: "Moneda",
    recipientName: "Nombre del destinatario",
    recipientBank: "Banco del destinatario",
    recipientAccount: "Cuenta del destinatario",
    paymentDescription: "Concepto del pago",
    dateTime: "Fecha y hora",
    currentStatus: "Estado actual",
    availableBalance: "Saldo disponible",
    transactionSummary: "Resumen de la transacción",
    conversionSummary: "Resumen de conversión de divisas",
    senderAmount: "Importe del remitente",
    recipientCurrency: "Moneda del destinatario",
    exchangeRate: "Tipo de cambio",
    transferFee: "Comisión de transferencia",
    estRecipientAmount: "Importe estimado para el destinatario",
    rateAppliedOn: "Tipo aplicado el",
    newBalance: "Nuevo saldo",
    transactionDetails: "Detalles de la transacción",
    time: "Hora",
    device: "Dispositivo",
    webBrowser: "Navegador web",
    reason: "Motivo",
    accountNumberLabel: "Su número de cuenta",
    cardEndingIn: "Tarjeta terminada en",
    reviewDetails: "Detalles de la revisión",
    reviewStatus: "Estado de la revisión",
    reviewCaseId: "ID del caso de revisión",
    holdReason: "Motivo de la retención",
    estReviewTime: "Tiempo estimado de revisión",
    transactionReference: "Referencia de la transacción",
  },
  status: {
    pending: "Pendiente",
    approved: "Aprobada",
    completed: "Completada",
    failed: "Fallida",
    onHold: "Retenida — En revisión",
    reversed: "Revertida",
    inProgressUnderReview: "En curso — En revisión",
  },
  txTypes: {
    transfer: "Transferencia",
    internationalTransfer: "Transferencia internacional",
    deposit: "Depósito",
    withdrawal: "Retiro",
    funding: "Abono en cuenta",
  },
  transferStatus: {
    approvedSubject: "Su transferencia ha sido aprobada",
    approvedHeadline: "Transferencia aprobada",
    approvedBody: "¡Buenas noticias! Su transferencia ha superado nuestra revisión y ha sido aprobada. Ahora se está procesando para su entrega al banco del destinatario.",
    completedSubject: "Su transferencia se ha completado",
    completedHeadline: "Transferencia completada",
    completedBody: "Su transferencia se ha completado correctamente. Los fondos han sido entregados al banco del destinatario. Conserve el número de referencia que aparece a continuación para sus registros.",
    failedSubject: "No se pudo completar su transferencia",
    failedHeadline: "Transferencia fallida",
    failedBody: "Lamentablemente, su transferencia no pudo completarse. El importe total ha sido devuelto a su saldo disponible. No se cobraron comisiones. Contacte con Atención al Cliente si necesita ayuda o desea reintentar este pago.",
    reversedSubject: "Su transferencia ha sido revertida",
    reversedHeadline: "Transferencia revertida",
    reversedBody: "Su transferencia ha sido revertida y el importe total ha sido abonado de nuevo en su saldo disponible. Si usted no solicitó esta reversión, contacte inmediatamente con Atención al Cliente.",
    genericSubject: "Actualización de la transferencia",
    genericHeadline: "Actualización de la transferencia",
    genericBody: "El estado de su transferencia se ha actualizado a: {status}.",
  },
  onHold: {
    subject: "Su transferencia está en revisión — Crestora Bank ITRT",
    headline: "Transferencia en revisión",
    intro: "Su transferencia ha sido puesta temporalmente en revisión por el <strong>Equipo de Revisión de Transferencias Internacionales (ITRT)</strong> de Crestora Bank como parte de nuestros procedimientos internos de seguridad y cumplimiento. Se trata de un paso rutinario diseñado para proteger su cuenta y garantizar que su pago se procese de forma segura.",
    teamName: "Equipo de Revisión de Transferencias Internacionales",
    teamDivision: "División de Seguridad y Cumplimiento — Crestora Bank",
    whatHappensNext: "Qué sucede a continuación",
    whatHappensNextBody: "Nuestra revisión está en curso y no se requiere ninguna acción inmediata salvo que se indique a continuación. Recibirá automáticamente otro correo en cuanto la revisión haya finalizado o si se necesita información adicional.",
    whatYouNeedToDo: "Qué debe hacer",
    step1: "Inicie sesión de forma segura en su cuenta de Crestora Bank.",
    step2: "Revise los detalles de la transacción.",
    step3: "Complete los pasos de verificación solicitados si se le pide.",
    step4: "Contacte con Atención al Cliente si necesita ayuda.",
  },
  transferPending: {
    subject: "Su transferencia ha sido enviada — Crestora Bank",
    headline: "Transferencia enviada",
    body: "Hemos recibido su orden de transferencia y ya se está procesando. Revise los detalles completos de su transacción a continuación y conserve el número de referencia para sus registros.",
    stagesNote: "Le notificaremos por correo electrónico en cada etapa de esta transacción. Si usted no autorizó esta transacción, contacte inmediatamente con nuestro equipo de soporte.",
  },
  deposit: {
    subject: "Depósito recibido — Crestora Bank",
    headline: "Notificación de depósito",
    body: "Se ha abonado un depósito en su cuenta de Crestora Bank. Su saldo actualizado se muestra a continuación.",
  },
  withdrawal: {
    subject: "Retiro procesado — Crestora Bank",
    headline: "Notificación de retiro",
    body: "Se ha procesado un retiro de su cuenta de Crestora Bank. Los detalles figuran a continuación.",
  },
  registration: {
    receivedSubject: "Su solicitud de cuenta en Crestora Bank",
    receivedHeadline: "Solicitud de cuenta recibida",
    receivedBody1: "Gracias por abrir una cuenta en Crestora Bank. Su cuenta ha sido creada y actualmente está en revisión.",
    receivedBody2: "Espere la aprobación del banco en un plazo de <strong>15 minutos a unas horas</strong>. Recibirá un correo de confirmación cuando su cuenta sea aprobada.",
    approvedSubject: "Su cuenta de Crestora Bank ha sido aprobada",
    approvedHeadline: "Cuenta aprobada",
    approvedBody: "¡Enhorabuena! Su cuenta de Crestora Bank ha sido aprobada y ya está activa.",
    approvedAccountLabel: "Su número de cuenta",
    approvedFooter: "Ya puede iniciar sesión en su banca en línea.",
  },
  login: {
    subject: "Nuevo inicio de sesión en su cuenta de Crestora Bank",
    headline: "Alerta de seguridad",
    body: "Hemos detectado un nuevo inicio de sesión en su cuenta de banca en línea de Crestora Bank.",
    noAction: "Si fue usted, no es necesaria ninguna acción. Si no reconoce esta actividad, contacte inmediatamente con nuestro equipo de soporte.",
  },
  card: {
    subject: "Su nueva tarjeta {cardType} está lista",
    headline: "Tarjeta aprobada",
    body: "Su solicitud de una nueva tarjeta {cardType} ha sido aprobada y generada.",
    footer: "Puede consultar los datos completos de su tarjeta de forma segura en su banca en línea.",
  },
  kyc: {
    approvedSubject: "Su identidad ha sido verificada",
    approvedHeadline: "Verificación de identidad aprobada",
    approvedBody: "¡Buenas noticias! Sus documentos de identidad han sido verificados correctamente. Los límites de su cuenta se han actualizado en consecuencia.",
    rejectedSubject: "Acción requerida: la verificación de identidad ha fallado",
    rejectedHeadline: "Verificación de identidad fallida",
    rejectedBody: "Lamentablemente, no pudimos verificar los documentos de identidad que envió.",
    rejectedFooter: "Inicie sesión en su cuenta y envíe documentos nuevos y legibles.",
  },
  security: {
    subject: "Alerta de seguridad: se ha cambiado {changeType}",
    headline: "Alerta de seguridad",
    body: "Le confirmamos que su <strong>{changeType}</strong> se ha cambiado recientemente.",
    footer: "Si usted no realizó este cambio, contacte inmediatamente con nuestro equipo de soporte para proteger su cuenta.",
  },
  otp: {
    subject: "Su código OTP de Crestora Bank",
    intro: "Su contraseña de un solo uso (OTP) para la verificación de su cuenta de Crestora Bank es:",
    expiry: "Este código caducará en 10 minutos. No comparta este código con nadie.",
    ignore: "Si no solicitó este código, ignore este correo.",
    secureVerification: "Verificación segura",
  },
  passwordReset: {
    subject: "Restablezca su contraseña de Crestora Bank",
    intro: "Estimado/a {name}: hemos recibido una solicitud para restablecer su contraseña de Crestora Bank. Utilice el código de verificación siguiente para continuar. Si no solicitó el restablecimiento, ignore este correo o contacte con soporte.",
  },
  depositRequest: {
    subject: "Solicitud de depósito recibida - Crestora Bank",
    headline: "Solicitud de depósito recibida",
    body: "Hemos recibido su solicitud de depósito (ID: {depositId}) y el justificante de pago asociado.",
    reviewNote: "Nuestro equipo está revisando su solicitud. Le notificaremos cuando los fondos se hayan abonado en su cuenta.",
    thanks: "Gracias por confiar en Crestora Bank.",
  },
  accountFunded: {
    subject: "Cuenta abonada",
    headline: "Cuenta abonada",
    bodyWithSender: "Su cuenta ha recibido un abono de {amount} de {sender}.",
    bodyNoSender: "Su cuenta ha recibido un abono de {amount}.",
  },
  supportReply: {
    subject: "Nuevo mensaje del soporte de Crestora Bank",
    headline: "Mensaje de soporte",
    intro: "Ha recibido un nuevo mensaje de nuestro equipo de Atención al Cliente:",
    footer: "Inicie sesión en su banca en línea para continuar la conversación.",
  },
  depositRejected: {
    subject: "Depósito rechazado - Crestora Bank",
    headline: "Depósito rechazado",
    body: "Su solicitud de depósito (ID: {reference}) por {amount} ha sido rechazada.",
    contactSupport: "Si cree que se trata de un error, póngase en contacto con nuestro equipo de soporte.",
    thanks: "Gracias por confiar en Crestora Bank.",
  },
};

const fr: PartialStrings = {
  common: {
    dear: "Cher/Chère {name},",
    hello: "Bonjour,",
    footerAutomated: "Ceci est un message automatique de Crestora Bank. Veuillez ne pas répondre directement à cet e-mail.",
    footerRights: "Tous droits réservés.",
    customerSupport: "Service Client",
    loginButton: "Se connecter à Crestora Bank",
    supportButton: "Contacter le Service Client",
    unauthorized: "Si vous n'avez pas autorisé cette transaction, veuillez contacter immédiatement notre équipe d'assistance.",
    messageFromBank: "Message de Crestora Bank",
  },
  labels: {
    customer: "Client",
    referenceNumber: "Numéro de référence",
    transactionType: "Type de transaction",
    amount: "Montant",
    currency: "Devise",
    recipientName: "Nom du bénéficiaire",
    recipientBank: "Banque du bénéficiaire",
    recipientAccount: "Compte du bénéficiaire",
    paymentDescription: "Libellé du paiement",
    dateTime: "Date et heure",
    currentStatus: "Statut actuel",
    availableBalance: "Solde disponible",
    transactionSummary: "Récapitulatif de la transaction",
    conversionSummary: "Récapitulatif de conversion de devises",
    senderAmount: "Montant de l'expéditeur",
    recipientCurrency: "Devise du bénéficiaire",
    exchangeRate: "Taux de change",
    transferFee: "Frais de virement",
    estRecipientAmount: "Montant estimé pour le bénéficiaire",
    rateAppliedOn: "Taux appliqué le",
    newBalance: "Nouveau solde",
    transactionDetails: "Détails de la transaction",
    time: "Heure",
    device: "Appareil",
    webBrowser: "Navigateur web",
    reason: "Motif",
    accountNumberLabel: "Votre numéro de compte",
    cardEndingIn: "Carte se terminant par",
    reviewDetails: "Détails de l'examen",
    reviewStatus: "Statut de l'examen",
    reviewCaseId: "ID du dossier d'examen",
    holdReason: "Motif de la retenue",
    estReviewTime: "Délai d'examen estimé",
    transactionReference: "Référence de la transaction",
  },
  status: {
    pending: "En attente",
    approved: "Approuvé",
    completed: "Terminé",
    failed: "Échoué",
    onHold: "En attente — En cours d'examen",
    reversed: "Annulé",
    inProgressUnderReview: "En cours — En cours d'examen",
  },
  txTypes: {
    transfer: "Virement",
    internationalTransfer: "Virement international",
    deposit: "Dépôt",
    withdrawal: "Retrait",
    funding: "Approvisionnement du compte",
  },
  transferStatus: {
    approvedSubject: "Votre virement a été approuvé",
    approvedHeadline: "Virement approuvé",
    approvedBody: "Bonne nouvelle ! Votre virement a passé notre examen et a été approuvé. Il est maintenant en cours de traitement pour être remis à la banque du bénéficiaire.",
    completedSubject: "Votre virement est terminé",
    completedHeadline: "Virement terminé",
    completedBody: "Votre virement a été effectué avec succès. Les fonds ont été remis à la banque du bénéficiaire. Veuillez conserver le numéro de référence ci-dessous pour vos archives.",
    failedSubject: "Votre virement n'a pas pu être effectué",
    failedHeadline: "Virement échoué",
    failedBody: "Malheureusement, votre virement n'a pas pu être effectué. Le montant total a été recrédité sur votre solde disponible. Aucuns frais n'ont été prélevés. Veuillez contacter le Service Client si vous avez besoin d'aide ou souhaitez réessayer ce paiement.",
    reversedSubject: "Votre virement a été annulé",
    reversedHeadline: "Virement annulé",
    reversedBody: "Votre virement a été annulé et le montant total a été recrédité sur votre solde disponible. Si vous n'avez pas demandé cette annulation, veuillez contacter immédiatement le Service Client.",
    genericSubject: "Mise à jour du virement",
    genericHeadline: "Mise à jour du virement",
    genericBody: "Le statut de votre virement a été mis à jour : {status}.",
  },
  onHold: {
    subject: "Votre virement est en cours d'examen — Crestora Bank ITRT",
    headline: "Virement en cours d'examen",
    intro: "Votre virement a été temporairement placé en examen par l'<strong>équipe d'examen des virements internationaux (ITRT)</strong> de Crestora Bank dans le cadre de nos procédures internes de sécurité et de conformité. Il s'agit d'une étape de routine destinée à protéger votre compte et à garantir que votre paiement est traité en toute sécurité.",
    teamName: "Équipe d'Examen des Virements Internationaux",
    teamDivision: "Division Sécurité et Conformité — Crestora Bank",
    whatHappensNext: "Et maintenant ?",
    whatHappensNextBody: "Notre examen est en cours et aucune action immédiate n'est requise, sauf indication ci-dessous. Vous recevrez automatiquement un autre e-mail dès que l'examen sera terminé ou si des informations supplémentaires sont nécessaires.",
    whatYouNeedToDo: "Ce que vous devez faire",
    step1: "Connectez-vous en toute sécurité à votre compte Crestora Bank.",
    step2: "Vérifiez les détails de la transaction.",
    step3: "Effectuez les étapes de vérification demandées le cas échéant.",
    step4: "Contactez le Service Client si vous avez besoin d'aide.",
  },
  transferPending: {
    subject: "Votre virement a été soumis — Crestora Bank",
    headline: "Virement soumis",
    body: "Nous avons bien reçu votre ordre de virement et il est en cours de traitement. Veuillez vérifier les détails complets de votre transaction ci-dessous et conserver le numéro de référence pour vos archives.",
    stagesNote: "Vous serez informé par e-mail à chaque étape de cette transaction. Si vous n'avez pas autorisé cette transaction, veuillez contacter immédiatement notre équipe d'assistance.",
  },
  deposit: {
    subject: "Dépôt reçu — Crestora Bank",
    headline: "Notification de dépôt",
    body: "Un dépôt a été crédité sur votre compte Crestora Bank. Votre solde mis à jour est indiqué ci-dessous.",
  },
  withdrawal: {
    subject: "Retrait traité — Crestora Bank",
    headline: "Notification de retrait",
    body: "Un retrait a été traité depuis votre compte Crestora Bank. Les détails figurent ci-dessous.",
  },
  registration: {
    receivedSubject: "Votre demande de compte Crestora Bank",
    receivedHeadline: "Demande de compte reçue",
    receivedBody1: "Merci d'avoir ouvert un compte chez Crestora Bank. Votre compte a été créé et est actuellement en cours d'examen.",
    receivedBody2: "Veuillez attendre l'approbation de la banque dans un délai de <strong>15 minutes à quelques heures</strong>. Vous recevrez un e-mail de confirmation dès que votre compte sera approuvé.",
    approvedSubject: "Votre compte Crestora Bank a été approuvé",
    approvedHeadline: "Compte approuvé",
    approvedBody: "Félicitations ! Votre compte Crestora Bank a été approuvé et est désormais actif.",
    approvedAccountLabel: "Votre numéro de compte",
    approvedFooter: "Vous pouvez maintenant vous connecter à votre espace bancaire en ligne.",
  },
  login: {
    subject: "Nouvelle connexion à votre compte Crestora Bank",
    headline: "Alerte de sécurité",
    body: "Nous avons détecté une nouvelle connexion à votre compte bancaire en ligne Crestora Bank.",
    noAction: "Si c'était vous, aucune action n'est nécessaire. Si vous ne reconnaissez pas cette activité, veuillez contacter immédiatement notre équipe d'assistance.",
  },
  card: {
    subject: "Votre nouvelle carte {cardType} est prête",
    headline: "Carte approuvée",
    body: "Votre demande de nouvelle carte {cardType} a été approuvée et générée.",
    footer: "Vous pouvez consulter les informations complètes de votre carte en toute sécurité dans votre espace bancaire en ligne.",
  },
  kyc: {
    approvedSubject: "Votre identité a été vérifiée",
    approvedHeadline: "Vérification d'identité approuvée",
    approvedBody: "Bonne nouvelle ! Vos documents d'identité ont été vérifiés avec succès. Les limites de votre compte ont été mises à jour en conséquence.",
    rejectedSubject: "Action requise : échec de la vérification d'identité",
    rejectedHeadline: "Échec de la vérification d'identité",
    rejectedBody: "Malheureusement, nous n'avons pas pu vérifier les documents d'identité que vous avez soumis.",
    rejectedFooter: "Veuillez vous connecter à votre compte et soumettre de nouveaux documents lisibles.",
  },
  security: {
    subject: "Alerte de sécurité : {changeType} modifié",
    headline: "Alerte de sécurité",
    body: "Nous vous confirmons que votre <strong>{changeType}</strong> a récemment été modifié.",
    footer: "Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement notre équipe d'assistance pour sécuriser votre compte.",
  },
  otp: {
    subject: "Votre code OTP Crestora Bank",
    intro: "Votre mot de passe à usage unique (OTP) pour la vérification de votre compte Crestora Bank est :",
    expiry: "Ce code expirera dans 10 minutes. Ne partagez ce code avec personne.",
    ignore: "Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.",
    secureVerification: "Vérification sécurisée",
  },
  passwordReset: {
    subject: "Réinitialisez votre mot de passe Crestora Bank",
    intro: "Cher/Chère {name}, nous avons reçu une demande de réinitialisation de votre mot de passe Crestora Bank. Utilisez le code de vérification ci-dessous pour continuer. Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail ou contactez l'assistance.",
  },
  depositRequest: {
    subject: "Demande de dépôt reçue - Crestora Bank",
    headline: "Demande de dépôt reçue",
    body: "Nous avons bien reçu votre demande de dépôt (ID : {depositId}) ainsi que le justificatif de paiement associé.",
    reviewNote: "Notre équipe examine actuellement votre demande. Nous vous informerons dès que les fonds auront été crédités sur votre compte.",
    thanks: "Merci de faire confiance à Crestora Bank.",
  },
  accountFunded: {
    subject: "Compte approvisionné",
    headline: "Compte approvisionné",
    bodyWithSender: "Votre compte a été approvisionné de {amount} de la part de {sender}.",
    bodyNoSender: "Votre compte a été approvisionné de {amount}.",
  },
  supportReply: {
    subject: "Nouveau message du support Crestora Bank",
    headline: "Message du support",
    intro: "Vous avez reçu un nouveau message de notre équipe du service client :",
    footer: "Connectez-vous à votre espace bancaire en ligne pour poursuivre la conversation.",
  },
  depositRejected: {
    subject: "Dépôt rejeté - Crestora Bank",
    headline: "Dépôt rejeté",
    body: "Votre demande de dépôt (ID : {reference}) d'un montant de {amount} a été rejetée.",
    contactSupport: "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support.",
    thanks: "Merci de faire confiance à Crestora Bank.",
  },
};

const pt: PartialStrings = {
  common: {
    dear: "Caro(a) {name},",
    hello: "Olá,",
    footerAutomated: "Esta é uma mensagem automática do Crestora Bank. Por favor, não responda diretamente a este e-mail.",
    footerRights: "Todos os direitos reservados.",
    customerSupport: "Apoio ao Cliente",
    loginButton: "Iniciar sessão no Crestora Bank",
    supportButton: "Contactar o Apoio ao Cliente",
    unauthorized: "Se não autorizou esta transação, contacte imediatamente a nossa equipa de suporte.",
    messageFromBank: "Mensagem do Crestora Bank",
  },
  labels: {
    customer: "Cliente",
    referenceNumber: "Número de referência",
    transactionType: "Tipo de transação",
    amount: "Montante",
    currency: "Moeda",
    recipientName: "Nome do destinatário",
    recipientBank: "Banco do destinatário",
    recipientAccount: "Conta do destinatário",
    paymentDescription: "Descrição do pagamento",
    dateTime: "Data e hora",
    currentStatus: "Estado atual",
    availableBalance: "Saldo disponível",
    transactionSummary: "Resumo da transação",
    conversionSummary: "Resumo da conversão cambial",
    senderAmount: "Montante do remetente",
    recipientCurrency: "Moeda do destinatário",
    exchangeRate: "Taxa de câmbio",
    transferFee: "Taxa de transferência",
    estRecipientAmount: "Montante estimado para o destinatário",
    rateAppliedOn: "Taxa aplicada em",
    newBalance: "Novo saldo",
    transactionDetails: "Detalhes da transação",
    time: "Hora",
    device: "Dispositivo",
    webBrowser: "Navegador web",
    reason: "Motivo",
    accountNumberLabel: "O seu número de conta",
    cardEndingIn: "Cartão terminado em",
    reviewDetails: "Detalhes da análise",
    reviewStatus: "Estado da análise",
    reviewCaseId: "ID do processo de análise",
    holdReason: "Motivo da retenção",
    estReviewTime: "Tempo estimado de análise",
    transactionReference: "Referência da transação",
  },
  status: {
    pending: "Pendente",
    approved: "Aprovada",
    completed: "Concluída",
    failed: "Falhada",
    onHold: "Retida — Em análise",
    reversed: "Revertida",
    inProgressUnderReview: "Em curso — Em análise",
  },
  txTypes: {
    transfer: "Transferência",
    internationalTransfer: "Transferência internacional",
    deposit: "Depósito",
    withdrawal: "Levantamento",
    funding: "Crédito em conta",
  },
  transferStatus: {
    approvedSubject: "A sua transferência foi aprovada",
    approvedHeadline: "Transferência aprovada",
    approvedBody: "Boas notícias! A sua transferência passou na nossa análise e foi aprovada. Está agora a ser processada para entrega ao banco do destinatário.",
    completedSubject: "A sua transferência está concluída",
    completedHeadline: "Transferência concluída",
    completedBody: "A sua transferência foi concluída com sucesso. Os fundos foram entregues ao banco do destinatário. Guarde o número de referência abaixo para os seus registos.",
    failedSubject: "Não foi possível concluir a sua transferência",
    failedHeadline: "Transferência falhada",
    failedBody: "Infelizmente, não foi possível concluir a sua transferência. O montante total foi devolvido ao seu saldo disponível. Não foram cobradas taxas. Contacte o Apoio ao Cliente se precisar de ajuda ou quiser repetir este pagamento.",
    reversedSubject: "A sua transferência foi revertida",
    reversedHeadline: "Transferência revertida",
    reversedBody: "A sua transferência foi revertida e o montante total foi creditado de volta no seu saldo disponível. Se não solicitou esta reversão, contacte imediatamente o Apoio ao Cliente.",
    genericSubject: "Atualização da transferência",
    genericHeadline: "Atualização da transferência",
    genericBody: "O estado da sua transferência foi atualizado para: {status}.",
  },
  onHold: {
    subject: "A sua transferência está em análise — Crestora Bank ITRT",
    headline: "Transferência em análise",
    intro: "A sua transferência foi temporariamente colocada em análise pela <strong>Equipa de Análise de Transferências Internacionais (ITRT)</strong> do Crestora Bank, no âmbito dos nossos procedimentos internos de segurança e conformidade. Trata-se de um passo de rotina concebido para proteger a sua conta e garantir que o seu pagamento é processado em segurança.",
    teamName: "Equipa de Análise de Transferências Internacionais",
    teamDivision: "Divisão de Segurança e Conformidade — Crestora Bank",
    whatHappensNext: "O que acontece a seguir",
    whatHappensNextBody: "A nossa análise está em curso e não é necessária qualquer ação imediata, salvo indicação abaixo. Receberá automaticamente outro e-mail assim que a análise estiver concluída ou se forem necessárias informações adicionais.",
    whatYouNeedToDo: "O que precisa de fazer",
    step1: "Inicie sessão em segurança na sua conta Crestora Bank.",
    step2: "Verifique os detalhes da transação.",
    step3: "Conclua os passos de verificação solicitados, se aplicável.",
    step4: "Contacte o Apoio ao Cliente se precisar de assistência.",
  },
  transferPending: {
    subject: "A sua transferência foi submetida — Crestora Bank",
    headline: "Transferência submetida",
    body: "Recebemos a sua ordem de transferência e ela está agora a ser processada. Verifique abaixo todos os detalhes da sua transação e guarde o número de referência para os seus registos.",
    stagesNote: "Será notificado por e-mail em cada fase desta transação. Se não autorizou esta transação, contacte imediatamente a nossa equipa de suporte.",
  },
  deposit: {
    subject: "Depósito recebido — Crestora Bank",
    headline: "Notificação de depósito",
    body: "Foi creditado um depósito na sua conta Crestora Bank. O seu saldo atualizado é apresentado abaixo.",
  },
  withdrawal: {
    subject: "Levantamento processado — Crestora Bank",
    headline: "Notificação de levantamento",
    body: "Foi processado um levantamento da sua conta Crestora Bank. Os detalhes encontram-se abaixo.",
  },
  registration: {
    receivedSubject: "A sua candidatura de conta Crestora Bank",
    receivedHeadline: "Candidatura de conta recebida",
    receivedBody1: "Obrigado por abrir uma conta no Crestora Bank. A sua conta foi criada e encontra-se atualmente em análise.",
    receivedBody2: "Aguarde a aprovação do banco dentro de <strong>15 minutos a algumas horas</strong>. Receberá um e-mail de confirmação assim que a sua conta for aprovada.",
    approvedSubject: "A sua conta Crestora Bank foi aprovada",
    approvedHeadline: "Conta aprovada",
    approvedBody: "Parabéns! A sua conta Crestora Bank foi aprovada e está agora ativa.",
    approvedAccountLabel: "O seu número de conta",
    approvedFooter: "Já pode iniciar sessão no seu painel de banca online.",
  },
  login: {
    subject: "Novo início de sessão na sua conta Crestora Bank",
    headline: "Alerta de segurança",
    body: "Detetámos um novo início de sessão na sua conta de banca online do Crestora Bank.",
    noAction: "Se foi você, não é necessária qualquer ação. Se não reconhece esta atividade, contacte imediatamente a nossa equipa de suporte.",
  },
  card: {
    subject: "O seu novo cartão {cardType} está pronto",
    headline: "Cartão aprovado",
    body: "O seu pedido de um novo cartão {cardType} foi aprovado e gerado.",
    footer: "Pode consultar os dados completos do seu cartão em segurança no seu painel de banca online.",
  },
  kyc: {
    approvedSubject: "A sua identidade foi verificada",
    approvedHeadline: "Verificação de identidade aprovada",
    approvedBody: "Boas notícias! Os seus documentos de identidade foram verificados com sucesso. Os limites da sua conta foram atualizados em conformidade.",
    rejectedSubject: "Ação necessária: falha na verificação de identidade",
    rejectedHeadline: "Falha na verificação de identidade",
    rejectedBody: "Infelizmente, não foi possível verificar os documentos de identidade que submeteu.",
    rejectedFooter: "Inicie sessão na sua conta e submeta documentos novos e legíveis.",
  },
  security: {
    subject: "Alerta de segurança: {changeType} alterado",
    headline: "Alerta de segurança",
    body: "Confirmamos que o seu <strong>{changeType}</strong> foi recentemente alterado.",
    footer: "Se não efetuou esta alteração, contacte imediatamente a nossa equipa de suporte para proteger a sua conta.",
  },
  otp: {
    subject: "O seu código OTP do Crestora Bank",
    intro: "A sua palavra-passe de utilização única (OTP) para a verificação da conta Crestora Bank é:",
    expiry: "Este código expira em 10 minutos. Não partilhe este código com ninguém.",
    ignore: "Se não solicitou este código, ignore este e-mail.",
    secureVerification: "Verificação segura",
  },
  passwordReset: {
    subject: "Redefina a sua palavra-passe do Crestora Bank",
    intro: "Caro(a) {name}, recebemos um pedido para redefinir a sua palavra-passe do Crestora Bank. Utilize o código de verificação abaixo para continuar. Se não solicitou a redefinição, ignore este e-mail ou contacte o suporte.",
  },
  depositRequest: {
    subject: "Pedido de depósito recebido - Crestora Bank",
    headline: "Pedido de depósito recebido",
    body: "Recebemos o seu pedido de depósito (ID: {depositId}) e o comprovativo de pagamento associado.",
    reviewNote: "A nossa equipa está a analisar o seu pedido. Iremos notificá-lo assim que os fundos forem creditados na sua conta.",
    thanks: "Obrigado por escolher o Crestora Bank.",
  },
  accountFunded: {
    subject: "Conta creditada",
    headline: "Conta creditada",
    bodyWithSender: "A sua conta foi creditada com {amount} de {sender}.",
    bodyNoSender: "A sua conta foi creditada com {amount}.",
  },
  supportReply: {
    subject: "Nova mensagem do suporte do Crestora Bank",
    headline: "Mensagem do suporte",
    intro: "Você recebeu uma nova mensagem da nossa equipe de Atendimento ao Cliente:",
    footer: "Acesse o seu internet banking para continuar a conversa.",
  },
  depositRejected: {
    subject: "Depósito rejeitado - Crestora Bank",
    headline: "Depósito rejeitado",
    body: "A sua solicitação de depósito (ID: {reference}) no valor de {amount} foi rejeitada.",
    contactSupport: "Se você acredita que isso é um erro, entre em contato com a nossa equipe de suporte.",
    thanks: "Obrigado por escolher o Crestora Bank.",
  },
};

const de: PartialStrings = {
  common: {
    dear: "Sehr geehrte(r) {name},",
    hello: "Guten Tag,",
    footerAutomated: "Dies ist eine automatische Nachricht der Crestora Bank. Bitte antworten Sie nicht direkt auf diese E-Mail.",
    footerRights: "Alle Rechte vorbehalten.",
    customerSupport: "Kundenservice",
    loginButton: "Bei Crestora Bank anmelden",
    supportButton: "Kundenservice kontaktieren",
    unauthorized: "Falls Sie diese Transaktion nicht autorisiert haben, kontaktieren Sie bitte umgehend unser Support-Team.",
    messageFromBank: "Nachricht der Crestora Bank",
  },
  labels: {
    customer: "Kunde",
    referenceNumber: "Referenznummer",
    transactionType: "Transaktionsart",
    amount: "Betrag",
    currency: "Währung",
    recipientName: "Name des Empfängers",
    recipientBank: "Bank des Empfängers",
    recipientAccount: "Konto des Empfängers",
    paymentDescription: "Verwendungszweck",
    dateTime: "Datum und Uhrzeit",
    currentStatus: "Aktueller Status",
    availableBalance: "Verfügbares Guthaben",
    transactionSummary: "Transaktionsübersicht",
    conversionSummary: "Währungsumrechnungsübersicht",
    senderAmount: "Betrag des Absenders",
    recipientCurrency: "Währung des Empfängers",
    exchangeRate: "Wechselkurs",
    transferFee: "Überweisungsgebühr",
    estRecipientAmount: "Voraussichtlicher Empfängerbetrag",
    rateAppliedOn: "Kurs angewendet am",
    newBalance: "Neues Guthaben",
    transactionDetails: "Transaktionsdetails",
    time: "Uhrzeit",
    device: "Gerät",
    webBrowser: "Webbrowser",
    reason: "Grund",
    accountNumberLabel: "Ihre Kontonummer",
    cardEndingIn: "Kartennummer endet auf",
    reviewDetails: "Prüfungsdetails",
    reviewStatus: "Prüfstatus",
    reviewCaseId: "Prüffall-ID",
    holdReason: "Grund der Zurückhaltung",
    estReviewTime: "Voraussichtliche Prüfdauer",
    transactionReference: "Transaktionsreferenz",
  },
  status: {
    pending: "Ausstehend",
    approved: "Genehmigt",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen",
    onHold: "Zurückgestellt — In Prüfung",
    reversed: "Storniert",
    inProgressUnderReview: "In Bearbeitung — In Prüfung",
  },
  txTypes: {
    transfer: "Überweisung",
    internationalTransfer: "Auslandsüberweisung",
    deposit: "Einzahlung",
    withdrawal: "Auszahlung",
    funding: "Kontogutschrift",
  },
  transferStatus: {
    approvedSubject: "Ihre Überweisung wurde genehmigt",
    approvedHeadline: "Überweisung genehmigt",
    approvedBody: "Gute Nachrichten! Ihre Überweisung hat unsere Prüfung bestanden und wurde genehmigt. Sie wird nun zur Zustellung an die Bank des Empfängers verarbeitet.",
    completedSubject: "Ihre Überweisung ist abgeschlossen",
    completedHeadline: "Überweisung abgeschlossen",
    completedBody: "Ihre Überweisung wurde erfolgreich abgeschlossen. Das Geld wurde an die Bank des Empfängers übermittelt. Bitte bewahren Sie die unten stehende Referenznummer für Ihre Unterlagen auf.",
    failedSubject: "Ihre Überweisung konnte nicht ausgeführt werden",
    failedHeadline: "Überweisung fehlgeschlagen",
    failedBody: "Leider konnte Ihre Überweisung nicht ausgeführt werden. Der gesamte Betrag wurde Ihrem verfügbaren Guthaben wieder gutgeschrieben. Es wurden keine Gebühren erhoben. Bitte kontaktieren Sie den Kundenservice, wenn Sie Hilfe benötigen oder die Zahlung erneut versuchen möchten.",
    reversedSubject: "Ihre Überweisung wurde storniert",
    reversedHeadline: "Überweisung storniert",
    reversedBody: "Ihre Überweisung wurde storniert und der gesamte Betrag wurde Ihrem verfügbaren Guthaben wieder gutgeschrieben. Falls Sie diese Stornierung nicht beantragt haben, kontaktieren Sie bitte umgehend den Kundenservice.",
    genericSubject: "Überweisungsaktualisierung",
    genericHeadline: "Überweisungsaktualisierung",
    genericBody: "Der Status Ihrer Überweisung wurde aktualisiert auf: {status}.",
  },
  onHold: {
    subject: "Ihre Überweisung wird geprüft — Crestora Bank ITRT",
    headline: "Überweisung in Prüfung",
    intro: "Ihre Überweisung wurde vorübergehend vom <strong>International Transfer Review Team (ITRT)</strong> der Crestora Bank zur Prüfung zurückgestellt. Dies ist Teil unserer internen Sicherheits- und Compliance-Verfahren — ein routinemäßiger Schritt zum Schutz Ihres Kontos und zur sicheren Verarbeitung Ihrer Zahlung.",
    teamName: "International Transfer Review Team",
    teamDivision: "Abteilung Sicherheit & Compliance — Crestora Bank",
    whatHappensNext: "Wie geht es weiter",
    whatHappensNextBody: "Unsere Prüfung läuft derzeit und es ist keine sofortige Handlung erforderlich, sofern unten nicht anders angegeben. Sie erhalten automatisch eine weitere E-Mail, sobald die Prüfung abgeschlossen ist oder falls zusätzliche Informationen von Ihnen benötigt werden.",
    whatYouNeedToDo: "Was Sie tun müssen",
    step1: "Melden Sie sich sicher bei Ihrem Crestora Bank-Konto an.",
    step2: "Überprüfen Sie die Transaktionsdetails.",
    step3: "Führen Sie ggf. die angeforderten Verifizierungsschritte durch.",
    step4: "Kontaktieren Sie den Kundenservice, falls Sie Unterstützung benötigen.",
  },
  transferPending: {
    subject: "Ihre Überweisung wurde übermittelt — Crestora Bank",
    headline: "Überweisung übermittelt",
    body: "Wir haben Ihren Überweisungsauftrag erhalten und er wird nun bearbeitet. Bitte überprüfen Sie unten die vollständigen Details Ihrer Transaktion und bewahren Sie die Referenznummer für Ihre Unterlagen auf.",
    stagesNote: "Sie werden in jeder Phase dieser Transaktion per E-Mail benachrichtigt. Falls Sie diese Transaktion nicht autorisiert haben, kontaktieren Sie bitte umgehend unser Support-Team.",
  },
  deposit: {
    subject: "Einzahlung erhalten — Crestora Bank",
    headline: "Einzahlungsbenachrichtigung",
    body: "Auf Ihrem Crestora Bank-Konto wurde eine Einzahlung gutgeschrieben. Ihr aktualisiertes Guthaben sehen Sie unten.",
  },
  withdrawal: {
    subject: "Auszahlung verarbeitet — Crestora Bank",
    headline: "Auszahlungsbenachrichtigung",
    body: "Von Ihrem Crestora Bank-Konto wurde eine Auszahlung verarbeitet. Die Details finden Sie unten.",
  },
  registration: {
    receivedSubject: "Ihr Crestora Bank-Kontoantrag",
    receivedHeadline: "Kontoantrag erhalten",
    receivedBody1: "Vielen Dank, dass Sie ein Konto bei der Crestora Bank eröffnet haben. Ihr Konto wurde erstellt und wird derzeit geprüft.",
    receivedBody2: "Bitte warten Sie auf die Genehmigung der Bank innerhalb von <strong>15 Minuten bis zu einigen Stunden</strong>. Sie erhalten eine Bestätigungs-E-Mail, sobald Ihr Konto genehmigt wurde.",
    approvedSubject: "Ihr Crestora Bank-Konto wurde genehmigt",
    approvedHeadline: "Konto genehmigt",
    approvedBody: "Herzlichen Glückwunsch! Ihr Crestora Bank-Konto wurde genehmigt und ist jetzt aktiv.",
    approvedAccountLabel: "Ihre Kontonummer",
    approvedFooter: "Sie können sich jetzt bei Ihrem Online-Banking anmelden.",
  },
  login: {
    subject: "Neue Anmeldung bei Ihrem Crestora Bank-Konto",
    headline: "Sicherheitswarnung",
    body: "Wir haben eine neue Anmeldung bei Ihrem Crestora Bank Online-Banking-Konto festgestellt.",
    noAction: "Wenn Sie das waren, ist keine Handlung erforderlich. Wenn Sie diese Aktivität nicht erkennen, kontaktieren Sie bitte umgehend unser Support-Team.",
  },
  card: {
    subject: "Ihre neue {cardType}-Karte ist bereit",
    headline: "Karte genehmigt",
    body: "Ihr Antrag auf eine neue {cardType}-Karte wurde genehmigt und die Karte wurde erstellt.",
    footer: "Sie können Ihre vollständigen Kartendaten sicher in Ihrem Online-Banking einsehen.",
  },
  kyc: {
    approvedSubject: "Ihre Identität wurde verifiziert",
    approvedHeadline: "Identitätsprüfung genehmigt",
    approvedBody: "Gute Nachrichten! Ihre Ausweisdokumente wurden erfolgreich verifiziert. Ihre Kontolimits wurden entsprechend angepasst.",
    rejectedSubject: "Handlung erforderlich: Identitätsprüfung fehlgeschlagen",
    rejectedHeadline: "Identitätsprüfung fehlgeschlagen",
    rejectedBody: "Leider konnten wir die von Ihnen eingereichten Ausweisdokumente nicht verifizieren.",
    rejectedFooter: "Bitte melden Sie sich bei Ihrem Konto an und reichen Sie neue, gut lesbare Dokumente ein.",
  },
  security: {
    subject: "Sicherheitswarnung: {changeType} geändert",
    headline: "Sicherheitswarnung",
    body: "Hiermit bestätigen wir, dass Ihr(e) <strong>{changeType}</strong> kürzlich geändert wurde.",
    footer: "Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie bitte umgehend unser Support-Team, um Ihr Konto zu sichern.",
  },
  otp: {
    subject: "Ihr Crestora Bank OTP-Code",
    intro: "Ihr Einmalpasswort (OTP) zur Verifizierung Ihres Crestora Bank-Kontos lautet:",
    expiry: "Dieser Code läuft in 10 Minuten ab. Teilen Sie diesen Code mit niemandem.",
    ignore: "Falls Sie diesen Code nicht angefordert haben, ignorieren Sie bitte diese E-Mail.",
    secureVerification: "Sichere Verifizierung",
  },
  passwordReset: {
    subject: "Setzen Sie Ihr Crestora Bank-Passwort zurück",
    intro: "Sehr geehrte(r) {name}, wir haben eine Anfrage zum Zurücksetzen Ihres Crestora Bank-Passworts erhalten. Verwenden Sie den unten stehenden Verifizierungscode, um fortzufahren. Falls Sie kein Zurücksetzen angefordert haben, ignorieren Sie diese E-Mail oder kontaktieren Sie den Support.",
  },
  depositRequest: {
    subject: "Einzahlungsanfrage erhalten - Crestora Bank",
    headline: "Einzahlungsanfrage erhalten",
    body: "Wir haben Ihre Einzahlungsanfrage (ID: {depositId}) und den zugehörigen Zahlungsnachweis erhalten.",
    reviewNote: "Unser Team prüft derzeit Ihre Anfrage. Wir benachrichtigen Sie, sobald das Geld Ihrem Konto gutgeschrieben wurde.",
    thanks: "Vielen Dank, dass Sie bei der Crestora Bank sind.",
  },
  accountFunded: {
    subject: "Konto aufgeladen",
    headline: "Konto aufgeladen",
    bodyWithSender: "Ihrem Konto wurden {amount} von {sender} gutgeschrieben.",
    bodyNoSender: "Ihrem Konto wurden {amount} gutgeschrieben.",
  },
  supportReply: {
    subject: "Neue Nachricht vom Crestora Bank Support",
    headline: "Support-Nachricht",
    intro: "Sie haben eine neue Nachricht von unserem Kundenservice-Team erhalten:",
    footer: "Melden Sie sich in Ihrem Online-Banking an, um das Gespräch fortzusetzen.",
  },
  depositRejected: {
    subject: "Einzahlung abgelehnt - Crestora Bank",
    headline: "Einzahlung abgelehnt",
    body: "Ihre Einzahlungsanfrage (ID: {reference}) über {amount} wurde abgelehnt.",
    contactSupport: "Wenn Sie glauben, dass dies ein Fehler ist, wenden Sie sich bitte an unser Support-Team.",
    thanks: "Vielen Dank, dass Sie Kunde der Crestora Bank sind.",
  },
};

const it: PartialStrings = {
  common: {
    dear: "Gentile {name},",
    hello: "Salve,",
    footerAutomated: "Questo è un messaggio automatico di Crestora Bank. Si prega di non rispondere direttamente a questa e-mail.",
    footerRights: "Tutti i diritti riservati.",
    customerSupport: "Assistenza Clienti",
    loginButton: "Accedi a Crestora Bank",
    supportButton: "Contatta l'Assistenza Clienti",
    unauthorized: "Se non hai autorizzato questa transazione, contatta immediatamente il nostro team di assistenza.",
    messageFromBank: "Messaggio da Crestora Bank",
  },
  labels: {
    customer: "Cliente",
    referenceNumber: "Numero di riferimento",
    transactionType: "Tipo di transazione",
    amount: "Importo",
    currency: "Valuta",
    recipientName: "Nome del beneficiario",
    recipientBank: "Banca del beneficiario",
    recipientAccount: "Conto del beneficiario",
    paymentDescription: "Causale del pagamento",
    dateTime: "Data e ora",
    currentStatus: "Stato attuale",
    availableBalance: "Saldo disponibile",
    transactionSummary: "Riepilogo della transazione",
    conversionSummary: "Riepilogo conversione valutaria",
    senderAmount: "Importo del mittente",
    recipientCurrency: "Valuta del beneficiario",
    exchangeRate: "Tasso di cambio",
    transferFee: "Commissione di bonifico",
    estRecipientAmount: "Importo stimato per il beneficiario",
    rateAppliedOn: "Tasso applicato il",
    newBalance: "Nuovo saldo",
    transactionDetails: "Dettagli della transazione",
    time: "Ora",
    device: "Dispositivo",
    webBrowser: "Browser web",
    reason: "Motivo",
    accountNumberLabel: "Il tuo numero di conto",
    cardEndingIn: "Carta che termina con",
    reviewDetails: "Dettagli della verifica",
    reviewStatus: "Stato della verifica",
    reviewCaseId: "ID pratica di verifica",
    holdReason: "Motivo della sospensione",
    estReviewTime: "Tempo di verifica stimato",
    transactionReference: "Riferimento della transazione",
  },
  status: {
    pending: "In attesa",
    approved: "Approvato",
    completed: "Completato",
    failed: "Non riuscito",
    onHold: "Sospeso — In verifica",
    reversed: "Stornato",
    inProgressUnderReview: "In corso — In verifica",
  },
  txTypes: {
    transfer: "Bonifico",
    internationalTransfer: "Bonifico internazionale",
    deposit: "Deposito",
    withdrawal: "Prelievo",
    funding: "Accredito sul conto",
  },
  transferStatus: {
    approvedSubject: "Il tuo bonifico è stato approvato",
    approvedHeadline: "Bonifico approvato",
    approvedBody: "Buone notizie! Il tuo bonifico ha superato la nostra verifica ed è stato approvato. È ora in elaborazione per la consegna alla banca del beneficiario.",
    completedSubject: "Il tuo bonifico è stato completato",
    completedHeadline: "Bonifico completato",
    completedBody: "Il tuo bonifico è stato completato con successo. I fondi sono stati consegnati alla banca del beneficiario. Conserva il numero di riferimento qui sotto per i tuoi archivi.",
    failedSubject: "Non è stato possibile completare il tuo bonifico",
    failedHeadline: "Bonifico non riuscito",
    failedBody: "Purtroppo non è stato possibile completare il tuo bonifico. L'intero importo è stato restituito al tuo saldo disponibile. Non sono state addebitate commissioni. Contatta l'Assistenza Clienti se hai bisogno di aiuto o desideri riprovare questo pagamento.",
    reversedSubject: "Il tuo bonifico è stato stornato",
    reversedHeadline: "Bonifico stornato",
    reversedBody: "Il tuo bonifico è stato stornato e l'intero importo è stato riaccreditato sul tuo saldo disponibile. Se non hai richiesto questo storno, contatta immediatamente l'Assistenza Clienti.",
    genericSubject: "Aggiornamento del bonifico",
    genericHeadline: "Aggiornamento del bonifico",
    genericBody: "Lo stato del tuo bonifico è stato aggiornato a: {status}.",
  },
  onHold: {
    subject: "Il tuo bonifico è in fase di verifica — Crestora Bank ITRT",
    headline: "Bonifico in verifica",
    intro: "Il tuo bonifico è stato temporaneamente messo in verifica dal <strong>Team di Verifica dei Bonifici Internazionali (ITRT)</strong> di Crestora Bank nell'ambito delle nostre procedure interne di sicurezza e conformità. Si tratta di un passaggio di routine progettato per proteggere il tuo conto e garantire che il pagamento venga elaborato in sicurezza.",
    teamName: "Team di Verifica dei Bonifici Internazionali",
    teamDivision: "Divisione Sicurezza e Conformità — Crestora Bank",
    whatHappensNext: "Cosa succede adesso",
    whatHappensNextBody: "La nostra verifica è in corso e non è richiesta alcuna azione immediata, salvo indicazione qui sotto. Riceverai automaticamente un'altra e-mail non appena la verifica sarà completata o se saranno necessarie ulteriori informazioni.",
    whatYouNeedToDo: "Cosa devi fare",
    step1: "Accedi in sicurezza al tuo conto Crestora Bank.",
    step2: "Controlla i dettagli della transazione.",
    step3: "Completa gli eventuali passaggi di verifica richiesti.",
    step4: "Contatta l'Assistenza Clienti se hai bisogno di aiuto.",
  },
  transferPending: {
    subject: "Il tuo bonifico è stato inviato — Crestora Bank",
    headline: "Bonifico inviato",
    body: "Abbiamo ricevuto il tuo ordine di bonifico che è ora in elaborazione. Controlla qui sotto tutti i dettagli della tua transazione e conserva il numero di riferimento per i tuoi archivi.",
    stagesNote: "Riceverai una notifica via e-mail in ogni fase di questa transazione. Se non hai autorizzato questa transazione, contatta immediatamente il nostro team di assistenza.",
  },
  deposit: {
    subject: "Deposito ricevuto — Crestora Bank",
    headline: "Notifica di deposito",
    body: "Un deposito è stato accreditato sul tuo conto Crestora Bank. Il tuo saldo aggiornato è mostrato qui sotto.",
  },
  withdrawal: {
    subject: "Prelievo elaborato — Crestora Bank",
    headline: "Notifica di prelievo",
    body: "Un prelievo è stato elaborato dal tuo conto Crestora Bank. I dettagli sono qui sotto.",
  },
  registration: {
    receivedSubject: "La tua richiesta di conto Crestora Bank",
    receivedHeadline: "Richiesta di conto ricevuta",
    receivedBody1: "Grazie per aver aperto un conto con Crestora Bank. Il tuo conto è stato creato ed è attualmente in fase di verifica.",
    receivedBody2: "Attendi l'approvazione della banca entro <strong>15 minuti fino ad alcune ore</strong>. Riceverai un'e-mail di conferma non appena il tuo conto sarà approvato.",
    approvedSubject: "Il tuo conto Crestora Bank è stato approvato",
    approvedHeadline: "Conto approvato",
    approvedBody: "Congratulazioni! Il tuo conto Crestora Bank è stato approvato ed è ora attivo.",
    approvedAccountLabel: "Il tuo numero di conto",
    approvedFooter: "Ora puoi accedere alla tua area di online banking.",
  },
  login: {
    subject: "Nuovo accesso al tuo conto Crestora Bank",
    headline: "Avviso di sicurezza",
    body: "Abbiamo rilevato un nuovo accesso al tuo conto di online banking Crestora Bank.",
    noAction: "Se sei stato tu, non è necessaria alcuna azione. Se non riconosci questa attività, contatta immediatamente il nostro team di assistenza.",
  },
  card: {
    subject: "La tua nuova carta {cardType} è pronta",
    headline: "Carta approvata",
    body: "La tua richiesta di una nuova carta {cardType} è stata approvata e generata.",
    footer: "Puoi visualizzare i dettagli completi della tua carta in sicurezza nella tua area di online banking.",
  },
  kyc: {
    approvedSubject: "La tua identità è stata verificata",
    approvedHeadline: "Verifica dell'identità approvata",
    approvedBody: "Buone notizie! I tuoi documenti d'identità sono stati verificati con successo. I limiti del tuo conto sono stati aggiornati di conseguenza.",
    rejectedSubject: "Azione richiesta: verifica dell'identità non riuscita",
    rejectedHeadline: "Verifica dell'identità non riuscita",
    rejectedBody: "Purtroppo non siamo riusciti a verificare i documenti d'identità che hai inviato.",
    rejectedFooter: "Accedi al tuo conto e invia documenti nuovi e leggibili.",
  },
  security: {
    subject: "Avviso di sicurezza: {changeType} modificato",
    headline: "Avviso di sicurezza",
    body: "Ti confermiamo che il tuo <strong>{changeType}</strong> è stato recentemente modificato.",
    footer: "Se non hai effettuato tu questa modifica, contatta immediatamente il nostro team di assistenza per proteggere il tuo conto.",
  },
  otp: {
    subject: "Il tuo codice OTP Crestora Bank",
    intro: "La tua password monouso (OTP) per la verifica del conto Crestora Bank è:",
    expiry: "Questo codice scadrà tra 10 minuti. Non condividere questo codice con nessuno.",
    ignore: "Se non hai richiesto questo codice, ignora questa e-mail.",
    secureVerification: "Verifica sicura",
  },
  passwordReset: {
    subject: "Reimposta la tua password di Crestora Bank",
    intro: "Gentile {name}, abbiamo ricevuto una richiesta di reimpostazione della tua password di Crestora Bank. Usa il codice di verifica qui sotto per continuare. Se non hai richiesto la reimpostazione, ignora questa e-mail o contatta l'assistenza.",
  },
  depositRequest: {
    subject: "Richiesta di deposito ricevuta - Crestora Bank",
    headline: "Richiesta di deposito ricevuta",
    body: "Abbiamo ricevuto la tua richiesta di deposito (ID: {depositId}) e l'eventuale prova di pagamento associata.",
    reviewNote: "Il nostro team sta esaminando la tua richiesta. Ti avviseremo non appena i fondi saranno accreditati sul tuo conto.",
    thanks: "Grazie per aver scelto Crestora Bank.",
  },
  accountFunded: {
    subject: "Conto accreditato",
    headline: "Conto accreditato",
    bodyWithSender: "Sul tuo conto sono stati accreditati {amount} da {sender}.",
    bodyNoSender: "Sul tuo conto sono stati accreditati {amount}.",
  },
  supportReply: {
    subject: "Nuovo messaggio dall'assistenza Crestora Bank",
    headline: "Messaggio dall'assistenza",
    intro: "Hai ricevuto un nuovo messaggio dal nostro team di Assistenza Clienti:",
    footer: "Accedi al tuo online banking per continuare la conversazione.",
  },
  depositRejected: {
    subject: "Deposito rifiutato - Crestora Bank",
    headline: "Deposito rifiutato",
    body: "La tua richiesta di deposito (ID: {reference}) di {amount} è stata rifiutata.",
    contactSupport: "Se ritieni che si tratti di un errore, contatta il nostro team di assistenza.",
    thanks: "Grazie per aver scelto Crestora Bank.",
  },
};

const nl: PartialStrings = {
  common: {
    dear: "Beste {name},",
    hello: "Hallo,",
    footerAutomated: "Dit is een automatisch bericht van Crestora Bank. Beantwoord deze e-mail niet rechtstreeks.",
    footerRights: "Alle rechten voorbehouden.",
    customerSupport: "Klantenservice",
    loginButton: "Inloggen bij Crestora Bank",
    supportButton: "Contact opnemen met de Klantenservice",
    unauthorized: "Als u deze transactie niet heeft geautoriseerd, neem dan onmiddellijk contact op met ons supportteam.",
    messageFromBank: "Bericht van Crestora Bank",
  },
  labels: {
    customer: "Klant",
    referenceNumber: "Referentienummer",
    transactionType: "Transactietype",
    amount: "Bedrag",
    currency: "Valuta",
    recipientName: "Naam ontvanger",
    recipientBank: "Bank ontvanger",
    recipientAccount: "Rekening ontvanger",
    paymentDescription: "Betalingsomschrijving",
    dateTime: "Datum en tijd",
    currentStatus: "Huidige status",
    availableBalance: "Beschikbaar saldo",
    transactionSummary: "Transactieoverzicht",
    conversionSummary: "Valutaconversie-overzicht",
    senderAmount: "Bedrag afzender",
    recipientCurrency: "Valuta ontvanger",
    exchangeRate: "Wisselkoers",
    transferFee: "Overboekingskosten",
    estRecipientAmount: "Geschat bedrag voor ontvanger",
    rateAppliedOn: "Koers toegepast op",
    newBalance: "Nieuw saldo",
    transactionDetails: "Transactiedetails",
    time: "Tijd",
    device: "Apparaat",
    webBrowser: "Webbrowser",
    reason: "Reden",
    accountNumberLabel: "Uw rekeningnummer",
    cardEndingIn: "Kaartnummer eindigend op",
    reviewDetails: "Beoordelingsdetails",
    reviewStatus: "Beoordelingsstatus",
    reviewCaseId: "Beoordelingszaak-ID",
    holdReason: "Reden van aanhouding",
    estReviewTime: "Geschatte beoordelingstijd",
    transactionReference: "Transactiereferentie",
  },
  status: {
    pending: "In behandeling",
    approved: "Goedgekeurd",
    completed: "Voltooid",
    failed: "Mislukt",
    onHold: "Aangehouden — In beoordeling",
    reversed: "Teruggedraaid",
    inProgressUnderReview: "Bezig — In beoordeling",
  },
  txTypes: {
    transfer: "Overboeking",
    internationalTransfer: "Internationale overboeking",
    deposit: "Storting",
    withdrawal: "Opname",
    funding: "Rekeningbijschrijving",
  },
  transferStatus: {
    approvedSubject: "Uw overboeking is goedgekeurd",
    approvedHeadline: "Overboeking goedgekeurd",
    approvedBody: "Goed nieuws! Uw overboeking heeft onze controle doorstaan en is goedgekeurd. De overboeking wordt nu verwerkt voor levering aan de bank van de ontvanger.",
    completedSubject: "Uw overboeking is voltooid",
    completedHeadline: "Overboeking voltooid",
    completedBody: "Uw overboeking is succesvol voltooid. Het geld is afgeleverd bij de bank van de ontvanger. Bewaar het onderstaande referentienummer voor uw administratie.",
    failedSubject: "Uw overboeking kon niet worden voltooid",
    failedHeadline: "Overboeking mislukt",
    failedBody: "Helaas kon uw overboeking niet worden voltooid. Het volledige bedrag is teruggestort op uw beschikbare saldo. Er zijn geen kosten in rekening gebracht. Neem contact op met de Klantenservice als u hulp nodig heeft of deze betaling opnieuw wilt proberen.",
    reversedSubject: "Uw overboeking is teruggedraaid",
    reversedHeadline: "Overboeking teruggedraaid",
    reversedBody: "Uw overboeking is teruggedraaid en het volledige bedrag is teruggestort op uw beschikbare saldo. Als u deze terugboeking niet heeft aangevraagd, neem dan onmiddellijk contact op met de Klantenservice.",
    genericSubject: "Update van overboeking",
    genericHeadline: "Update van overboeking",
    genericBody: "De status van uw overboeking is bijgewerkt naar: {status}.",
  },
  onHold: {
    subject: "Uw overboeking wordt beoordeeld — Crestora Bank ITRT",
    headline: "Overboeking in beoordeling",
    intro: "Uw overboeking is tijdelijk in beoordeling geplaatst door het <strong>International Transfer Review Team (ITRT)</strong> van Crestora Bank als onderdeel van onze interne beveiligings- en complianceprocedures. Dit is een routinestap die is ontworpen om uw rekening te beschermen en ervoor te zorgen dat uw betaling veilig wordt verwerkt.",
    teamName: "International Transfer Review Team",
    teamDivision: "Afdeling Beveiliging & Compliance — Crestora Bank",
    whatHappensNext: "Wat gebeurt er nu",
    whatHappensNextBody: "Onze beoordeling is momenteel bezig en er is geen onmiddellijke actie vereist, tenzij hieronder aangegeven. U ontvangt automatisch een nieuwe e-mail zodra de beoordeling is afgerond of als er aanvullende informatie van u nodig is.",
    whatYouNeedToDo: "Wat u moet doen",
    step1: "Log veilig in op uw Crestora Bank-rekening.",
    step2: "Controleer de transactiedetails.",
    step3: "Voltooi eventuele gevraagde verificatiestappen indien daarom wordt gevraagd.",
    step4: "Neem contact op met de Klantenservice als u hulp nodig heeft.",
  },
  transferPending: {
    subject: "Uw overboeking is ingediend — Crestora Bank",
    headline: "Overboeking ingediend",
    body: "We hebben uw overboekingsopdracht ontvangen en deze wordt nu verwerkt. Controleer hieronder de volledige details van uw transactie en bewaar het referentienummer voor uw administratie.",
    stagesNote: "U wordt per e-mail op de hoogte gehouden van elke fase van deze transactie. Als u deze transactie niet heeft geautoriseerd, neem dan onmiddellijk contact op met ons supportteam.",
  },
  deposit: {
    subject: "Storting ontvangen — Crestora Bank",
    headline: "Stortingsmelding",
    body: "Er is een storting bijgeschreven op uw Crestora Bank-rekening. Uw bijgewerkte saldo staat hieronder.",
  },
  withdrawal: {
    subject: "Opname verwerkt — Crestora Bank",
    headline: "Opnamemelding",
    body: "Er is een opname verwerkt van uw Crestora Bank-rekening. De details staan hieronder.",
  },
  registration: {
    receivedSubject: "Uw Crestora Bank-rekeningaanvraag",
    receivedHeadline: "Rekeningaanvraag ontvangen",
    receivedBody1: "Bedankt voor het openen van een rekening bij Crestora Bank. Uw rekening is aangemaakt en wordt momenteel beoordeeld.",
    receivedBody2: "Wacht op goedkeuring van de bank binnen <strong>15 minuten tot enkele uren</strong>. U ontvangt een bevestigingsmail zodra uw rekening is goedgekeurd.",
    approvedSubject: "Uw Crestora Bank-rekening is goedgekeurd",
    approvedHeadline: "Rekening goedgekeurd",
    approvedBody: "Gefeliciteerd! Uw Crestora Bank-rekening is goedgekeurd en is nu actief.",
    approvedAccountLabel: "Uw rekeningnummer",
    approvedFooter: "U kunt nu inloggen op uw online bankieren-dashboard.",
  },
  login: {
    subject: "Nieuwe aanmelding bij uw Crestora Bank-rekening",
    headline: "Beveiligingswaarschuwing",
    body: "We hebben een nieuwe aanmelding gedetecteerd bij uw Crestora Bank online bankieren-account.",
    noAction: "Als u dit was, is er geen actie nodig. Herkent u deze activiteit niet, neem dan onmiddellijk contact op met ons supportteam.",
  },
  card: {
    subject: "Uw nieuwe {cardType}-kaart is klaar",
    headline: "Kaart goedgekeurd",
    body: "Uw aanvraag voor een nieuwe {cardType}-kaart is goedgekeurd en aangemaakt.",
    footer: "U kunt uw volledige kaartgegevens veilig bekijken in uw online bankieren-dashboard.",
  },
  kyc: {
    approvedSubject: "Uw identiteit is geverifieerd",
    approvedHeadline: "Identiteitsverificatie goedgekeurd",
    approvedBody: "Goed nieuws! Uw identiteitsdocumenten zijn succesvol geverifieerd. Uw rekeninglimieten zijn dienovereenkomstig bijgewerkt.",
    rejectedSubject: "Actie vereist: identiteitsverificatie mislukt",
    rejectedHeadline: "Identiteitsverificatie mislukt",
    rejectedBody: "Helaas konden we de door u ingediende identiteitsdocumenten niet verifiëren.",
    rejectedFooter: "Log in op uw account en dien nieuwe, duidelijk leesbare documenten in.",
  },
  security: {
    subject: "Beveiligingswaarschuwing: {changeType} gewijzigd",
    headline: "Beveiligingswaarschuwing",
    body: "Hierbij bevestigen wij dat uw <strong>{changeType}</strong> onlangs is gewijzigd.",
    footer: "Als u deze wijziging niet heeft aangebracht, neem dan onmiddellijk contact op met ons supportteam om uw account te beveiligen.",
  },
  otp: {
    subject: "Uw Crestora Bank OTP-code",
    intro: "Uw eenmalige wachtwoord (OTP) voor de verificatie van uw Crestora Bank-rekening is:",
    expiry: "Deze code verloopt over 10 minuten. Deel deze code met niemand.",
    ignore: "Als u deze code niet heeft aangevraagd, kunt u deze e-mail negeren.",
    secureVerification: "Veilige verificatie",
  },
  passwordReset: {
    subject: "Stel uw Crestora Bank-wachtwoord opnieuw in",
    intro: "Beste {name}, we hebben een verzoek ontvangen om uw Crestora Bank-wachtwoord opnieuw in te stellen. Gebruik de onderstaande verificatiecode om door te gaan. Als u geen wachtwoordherstel heeft aangevraagd, negeer dan deze e-mail of neem contact op met support.",
  },
  depositRequest: {
    subject: "Stortingsverzoek ontvangen - Crestora Bank",
    headline: "Stortingsverzoek ontvangen",
    body: "We hebben uw stortingsverzoek (ID: {depositId}) en het bijbehorende betalingsbewijs ontvangen.",
    reviewNote: "Ons team beoordeelt momenteel uw verzoek. We stellen u op de hoogte zodra het geld op uw rekening is bijgeschreven.",
    thanks: "Bedankt dat u bankiert bij Crestora Bank.",
  },
  accountFunded: {
    subject: "Rekening bijgeschreven",
    headline: "Rekening bijgeschreven",
    bodyWithSender: "Uw rekening is bijgeschreven met {amount} van {sender}.",
    bodyNoSender: "Uw rekening is bijgeschreven met {amount}.",
  },
  supportReply: {
    subject: "Nieuw bericht van Crestora Bank Support",
    headline: "Supportbericht",
    intro: "U heeft een nieuw bericht ontvangen van ons klantenserviceteam:",
    footer: "Log in op uw internetbankieren om het gesprek voort te zetten.",
  },
  depositRejected: {
    subject: "Storting afgewezen - Crestora Bank",
    headline: "Storting afgewezen",
    body: "Uw stortingsverzoek (ID: {reference}) van {amount} is afgewezen.",
    contactSupport: "Als u denkt dat dit een vergissing is, neem dan contact op met ons supportteam.",
    thanks: "Bedankt dat u bankiert bij Crestora Bank.",
  },
};

const ar: PartialStrings = {
  common: {
    dear: "عزيزي/عزيزتي {name}،",
    hello: "مرحباً،",
    footerAutomated: "هذه رسالة تلقائية من بنك كريستورا. يُرجى عدم الرد مباشرة على هذا البريد الإلكتروني.",
    footerRights: "جميع الحقوق محفوظة.",
    customerSupport: "خدمة العملاء",
    loginButton: "تسجيل الدخول إلى بنك كريستورا",
    supportButton: "التواصل مع خدمة العملاء",
    unauthorized: "إذا لم تقم بتفويض هذه المعاملة، يُرجى التواصل فوراً مع فريق الدعم لدينا.",
    messageFromBank: "رسالة من بنك كريستورا",
  },
  labels: {
    customer: "العميل",
    referenceNumber: "الرقم المرجعي",
    transactionType: "نوع المعاملة",
    amount: "المبلغ",
    currency: "العملة",
    recipientName: "اسم المستفيد",
    recipientBank: "بنك المستفيد",
    recipientAccount: "حساب المستفيد",
    paymentDescription: "وصف الدفعة",
    dateTime: "التاريخ والوقت",
    currentStatus: "الحالة الحالية",
    availableBalance: "الرصيد المتاح",
    transactionSummary: "ملخص المعاملة",
    conversionSummary: "ملخص تحويل العملات",
    senderAmount: "مبلغ المرسل",
    recipientCurrency: "عملة المستفيد",
    exchangeRate: "سعر الصرف",
    transferFee: "رسوم التحويل",
    estRecipientAmount: "المبلغ التقديري للمستفيد",
    rateAppliedOn: "تم تطبيق السعر في",
    newBalance: "الرصيد الجديد",
    transactionDetails: "تفاصيل المعاملة",
    time: "الوقت",
    device: "الجهاز",
    webBrowser: "متصفح الويب",
    reason: "السبب",
    accountNumberLabel: "رقم حسابك",
    cardEndingIn: "بطاقة تنتهي بالأرقام",
    reviewDetails: "تفاصيل المراجعة",
    reviewStatus: "حالة المراجعة",
    reviewCaseId: "رقم حالة المراجعة",
    holdReason: "سبب التعليق",
    estReviewTime: "الوقت التقديري للمراجعة",
    transactionReference: "مرجع المعاملة",
  },
  status: {
    pending: "قيد الانتظار",
    approved: "تمت الموافقة",
    completed: "مكتملة",
    failed: "فشلت",
    onHold: "معلّقة — قيد المراجعة",
    reversed: "معكوسة",
    inProgressUnderReview: "قيد التنفيذ — قيد المراجعة",
  },
  txTypes: {
    transfer: "تحويل",
    internationalTransfer: "تحويل دولي",
    deposit: "إيداع",
    withdrawal: "سحب",
    funding: "تمويل الحساب",
  },
  transferStatus: {
    approvedSubject: "تمت الموافقة على تحويلك",
    approvedHeadline: "تمت الموافقة على التحويل",
    approvedBody: "أخبار سارة! اجتاز تحويلك مراجعتنا وتمت الموافقة عليه. تتم معالجته الآن لتسليمه إلى بنك المستفيد.",
    completedSubject: "اكتمل تحويلك",
    completedHeadline: "اكتمل التحويل",
    completedBody: "تم إكمال تحويلك بنجاح. تم تسليم الأموال إلى بنك المستفيد. يُرجى الاحتفاظ بالرقم المرجعي أدناه لسجلاتك.",
    failedSubject: "تعذّر إكمال تحويلك",
    failedHeadline: "فشل التحويل",
    failedBody: "للأسف، تعذّر إكمال تحويلك. تمت إعادة المبلغ بالكامل إلى رصيدك المتاح. لم يتم خصم أي رسوم. يُرجى التواصل مع خدمة العملاء إذا كنت بحاجة إلى مساعدة أو ترغب في إعادة محاولة هذه الدفعة.",
    reversedSubject: "تم عكس تحويلك",
    reversedHeadline: "تم عكس التحويل",
    reversedBody: "تم عكس تحويلك وإعادة المبلغ بالكامل إلى رصيدك المتاح. إذا لم تطلب هذا الإجراء، يُرجى التواصل فوراً مع خدمة العملاء.",
    genericSubject: "تحديث التحويل",
    genericHeadline: "تحديث التحويل",
    genericBody: "تم تحديث حالة تحويلك إلى: {status}.",
  },
  onHold: {
    subject: "تحويلك قيد المراجعة — فريق ITRT في بنك كريستورا",
    headline: "التحويل قيد المراجعة",
    intro: "تم وضع تحويلك مؤقتاً قيد المراجعة من قبل <strong>فريق مراجعة التحويلات الدولية (ITRT)</strong> في بنك كريستورا في إطار إجراءاتنا الداخلية للأمان والامتثال. هذه خطوة روتينية مصممة لحماية حسابك وضمان معالجة دفعتك بأمان.",
    teamName: "فريق مراجعة التحويلات الدولية",
    teamDivision: "قسم الأمان والامتثال — بنك كريستورا",
    whatHappensNext: "ماذا سيحدث بعد ذلك",
    whatHappensNextBody: "مراجعتنا جارية حالياً ولا يلزم اتخاذ أي إجراء فوري ما لم يُذكر أدناه. ستتلقى تلقائياً بريداً إلكترونياً آخر فور اكتمال المراجعة أو إذا لزم الحصول على معلومات إضافية منك.",
    whatYouNeedToDo: "ما عليك القيام به",
    step1: "سجّل الدخول بأمان إلى حسابك في بنك كريستورا.",
    step2: "راجع تفاصيل المعاملة.",
    step3: "أكمل أي خطوات تحقق مطلوبة إذا طُلب منك ذلك.",
    step4: "تواصل مع خدمة العملاء إذا احتجت إلى المساعدة.",
  },
  transferPending: {
    subject: "تم إرسال تحويلك — بنك كريستورا",
    headline: "تم إرسال التحويل",
    body: "لقد استلمنا تعليمات التحويل الخاصة بك وتتم معالجتها الآن. يُرجى مراجعة التفاصيل الكاملة لمعاملتك أدناه والاحتفاظ بالرقم المرجعي لسجلاتك.",
    stagesNote: "سيتم إخطارك عبر البريد الإلكتروني في كل مرحلة من مراحل هذه المعاملة. إذا لم تقم بتفويض هذه المعاملة، يُرجى التواصل فوراً مع فريق الدعم لدينا.",
  },
  deposit: {
    subject: "تم استلام إيداع — بنك كريستورا",
    headline: "إشعار إيداع",
    body: "تم إيداع مبلغ في حسابك لدى بنك كريستورا. رصيدك المحدّث موضح أدناه.",
  },
  withdrawal: {
    subject: "تمت معالجة السحب — بنك كريستورا",
    headline: "إشعار سحب",
    body: "تمت معالجة عملية سحب من حسابك لدى بنك كريستورا. التفاصيل أدناه.",
  },
  registration: {
    receivedSubject: "طلب فتح حسابك في بنك كريستورا",
    receivedHeadline: "تم استلام طلب فتح الحساب",
    receivedBody1: "شكراً لفتحك حساباً لدى بنك كريستورا. تم إنشاء حسابك وهو حالياً قيد المراجعة.",
    receivedBody2: "يُرجى انتظار موافقة البنك خلال <strong>15 دقيقة إلى بضع ساعات</strong>. ستتلقى بريداً إلكترونياً للتأكيد فور الموافقة على حسابك.",
    approvedSubject: "تمت الموافقة على حسابك في بنك كريستورا",
    approvedHeadline: "تمت الموافقة على الحساب",
    approvedBody: "تهانينا! تمت الموافقة على حسابك في بنك كريستورا وهو الآن نشط.",
    approvedAccountLabel: "رقم حسابك",
    approvedFooter: "يمكنك الآن تسجيل الدخول إلى لوحة الخدمات المصرفية عبر الإنترنت.",
  },
  login: {
    subject: "تسجيل دخول جديد إلى حسابك في بنك كريستورا",
    headline: "تنبيه أمني",
    body: "رصدنا تسجيل دخول جديداً إلى حسابك المصرفي عبر الإنترنت لدى بنك كريستورا.",
    noAction: "إذا كنت أنت من قام بذلك، فلا حاجة لأي إجراء. إذا لم تتعرف على هذا النشاط، يُرجى التواصل فوراً مع فريق الدعم لدينا.",
  },
  card: {
    subject: "بطاقتك الجديدة {cardType} جاهزة",
    headline: "تمت الموافقة على البطاقة",
    body: "تمت الموافقة على طلبك للحصول على بطاقة {cardType} جديدة وتم إصدارها.",
    footer: "يمكنك عرض تفاصيل بطاقتك الكاملة بأمان في لوحة الخدمات المصرفية عبر الإنترنت.",
  },
  kyc: {
    approvedSubject: "تم التحقق من هويتك",
    approvedHeadline: "تمت الموافقة على التحقق من الهوية",
    approvedBody: "أخبار سارة! تم التحقق من وثائق هويتك بنجاح. تم تحديث حدود حسابك وفقاً لذلك.",
    rejectedSubject: "إجراء مطلوب: فشل التحقق من الهوية",
    rejectedHeadline: "فشل التحقق من الهوية",
    rejectedBody: "للأسف، لم نتمكن من التحقق من وثائق الهوية التي قدمتها.",
    rejectedFooter: "يُرجى تسجيل الدخول إلى حسابك وتقديم وثائق جديدة وواضحة.",
  },
  security: {
    subject: "تنبيه أمني: تم تغيير {changeType}",
    headline: "تنبيه أمني",
    body: "هذا تأكيد بأن <strong>{changeType}</strong> الخاص بك قد تم تغييره مؤخراً.",
    footer: "إذا لم تقم بهذا التغيير، يُرجى التواصل فوراً مع فريق الدعم لدينا لتأمين حسابك.",
  },
  otp: {
    subject: "رمز التحقق الخاص بك من بنك كريستورا",
    intro: "كلمة المرور لمرة واحدة (OTP) للتحقق من حسابك في بنك كريستورا هي:",
    expiry: "ستنتهي صلاحية هذا الرمز خلال 10 دقائق. لا تشارك هذا الرمز مع أي شخص.",
    ignore: "إذا لم تطلب هذا الرمز، يُرجى تجاهل هذا البريد الإلكتروني.",
    secureVerification: "تحقق آمن",
  },
  passwordReset: {
    subject: "إعادة تعيين كلمة مرور بنك كريستورا",
    intro: "عزيزي/عزيزتي {name}، لقد تلقينا طلباً لإعادة تعيين كلمة مرور حسابك في بنك كريستورا. استخدم رمز التحقق أدناه للمتابعة. إذا لم تطلب إعادة التعيين، يُرجى تجاهل هذا البريد أو التواصل مع الدعم.",
  },
  depositRequest: {
    subject: "تم استلام طلب الإيداع - بنك كريستورا",
    headline: "تم استلام طلب الإيداع",
    body: "لقد استلمنا طلب الإيداع الخاص بك (المعرّف: {depositId}) وأي إثبات دفع مرفق.",
    reviewNote: "يقوم فريقنا حالياً بمراجعة طلبك. سنخطرك فور إضافة الأموال إلى حسابك.",
    thanks: "شكراً لتعاملك مع بنك كريستورا.",
  },
  accountFunded: {
    subject: "تم تمويل الحساب",
    headline: "تم تمويل الحساب",
    bodyWithSender: "تم تمويل حسابك بمبلغ {amount} من {sender}.",
    bodyNoSender: "تم تمويل حسابك بمبلغ {amount}.",
  },
  supportReply: {
    subject: "رسالة جديدة من دعم بنك كريستورا",
    headline: "رسالة من الدعم",
    intro: "لقد تلقيت رسالة جديدة من فريق خدمة العملاء لدينا:",
    footer: "سجّل الدخول إلى الخدمات المصرفية عبر الإنترنت لمتابعة المحادثة.",
  },
  depositRejected: {
    subject: "تم رفض الإيداع - بنك كريستورا",
    headline: "تم رفض الإيداع",
    body: "تم رفض طلب الإيداع الخاص بك (المعرّف: {reference}) بمبلغ {amount}.",
    contactSupport: "إذا كنت تعتقد أن هذا خطأ، يُرجى التواصل مع فريق الدعم لدينا.",
    thanks: "شكراً لتعاملك مع بنك كريستورا.",
  },
};

const zh: PartialStrings = {
  common: {
    dear: "尊敬的 {name}：",
    hello: "您好：",
    footerAutomated: "这是来自 Crestora Bank 的自动消息，请勿直接回复此邮件。",
    footerRights: "版权所有。",
    customerSupport: "客户服务",
    loginButton: "登录 Crestora Bank",
    supportButton: "联系客户服务",
    unauthorized: "如果您未授权此交易，请立即联系我们的支持团队。",
    messageFromBank: "来自 Crestora Bank 的消息",
  },
  labels: {
    customer: "客户",
    referenceNumber: "参考编号",
    transactionType: "交易类型",
    amount: "金额",
    currency: "币种",
    recipientName: "收款人姓名",
    recipientBank: "收款银行",
    recipientAccount: "收款账户",
    paymentDescription: "付款说明",
    dateTime: "日期与时间",
    currentStatus: "当前状态",
    availableBalance: "可用余额",
    transactionSummary: "交易摘要",
    conversionSummary: "货币兑换摘要",
    senderAmount: "汇款金额",
    recipientCurrency: "收款币种",
    exchangeRate: "汇率",
    transferFee: "转账手续费",
    estRecipientAmount: "预计到账金额",
    rateAppliedOn: "汇率适用日期",
    newBalance: "最新余额",
    transactionDetails: "交易明细",
    time: "时间",
    device: "设备",
    webBrowser: "网页浏览器",
    reason: "原因",
    accountNumberLabel: "您的账号",
    cardEndingIn: "卡号尾号",
    reviewDetails: "审核详情",
    reviewStatus: "审核状态",
    reviewCaseId: "审核案件编号",
    holdReason: "冻结原因",
    estReviewTime: "预计审核时间",
    transactionReference: "交易参考号",
  },
  status: {
    pending: "处理中",
    approved: "已批准",
    completed: "已完成",
    failed: "失败",
    onHold: "暂缓 — 审核中",
    reversed: "已冲正",
    inProgressUnderReview: "进行中 — 审核中",
  },
  txTypes: {
    transfer: "转账",
    internationalTransfer: "国际转账",
    deposit: "存款",
    withdrawal: "取款",
    funding: "账户入账",
  },
  transferStatus: {
    approvedSubject: "您的转账已获批准",
    approvedHeadline: "转账已批准",
    approvedBody: "好消息！您的转账已通过审核并获批准，目前正在处理中，即将送达收款银行。",
    completedSubject: "您的转账已完成",
    completedHeadline: "转账已完成",
    completedBody: "您的转账已成功完成，资金已送达收款银行。请保留下方参考编号以备查询。",
    failedSubject: "您的转账未能完成",
    failedHeadline: "转账失败",
    failedBody: "很遗憾，您的转账未能完成。全部金额已退回您的可用余额，未收取任何费用。如需帮助或希望重新尝试此笔付款，请联系客户服务。",
    reversedSubject: "您的转账已被冲正",
    reversedHeadline: "转账已冲正",
    reversedBody: "您的转账已被冲正，全部金额已退回您的可用余额。如果您未申请此项冲正，请立即联系客户服务。",
    genericSubject: "转账状态更新",
    genericHeadline: "转账状态更新",
    genericBody: "您的转账状态已更新为：{status}。",
  },
  onHold: {
    subject: "您的转账正在审核中 — Crestora Bank ITRT",
    headline: "转账审核中",
    intro: "根据我们的内部安全与合规程序，您的转账已被 Crestora Bank <strong>国际转账审核团队（ITRT）</strong>暂时置于审核状态。这是一项例行程序，旨在保护您的账户并确保您的付款得到安全处理。",
    teamName: "国际转账审核团队",
    teamDivision: "安全与合规部 — Crestora Bank",
    whatHappensNext: "接下来会发生什么",
    whatHappensNextBody: "审核目前正在进行中，除非下方另有说明，您无需立即采取任何行动。审核完成后或需要您提供其他信息时，您将自动收到另一封电子邮件。",
    whatYouNeedToDo: "您需要做什么",
    step1: "安全登录您的 Crestora Bank 账户。",
    step2: "核对交易详情。",
    step3: "如有提示，请完成所需的验证步骤。",
    step4: "如需协助，请联系客户服务。",
  },
  transferPending: {
    subject: "您的转账已提交 — Crestora Bank",
    headline: "转账已提交",
    body: "我们已收到您的转账指令，目前正在处理中。请查看下方交易的完整详情，并保留参考编号以备查询。",
    stagesNote: "本笔交易的每个阶段都会通过电子邮件通知您。如果您未授权此交易，请立即联系我们的支持团队。",
  },
  deposit: {
    subject: "存款已到账 — Crestora Bank",
    headline: "存款通知",
    body: "一笔存款已存入您的 Crestora Bank 账户，最新余额如下所示。",
  },
  withdrawal: {
    subject: "取款已处理 — Crestora Bank",
    headline: "取款通知",
    body: "您的 Crestora Bank 账户已处理一笔取款，详情如下。",
  },
  registration: {
    receivedSubject: "您的 Crestora Bank 开户申请",
    receivedHeadline: "开户申请已收到",
    receivedBody1: "感谢您在 Crestora Bank 开立账户。您的账户已创建，目前正在审核中。",
    receivedBody2: "请等待银行审批，预计需要 <strong>15 分钟至数小时</strong>。账户获批后，您将收到确认邮件。",
    approvedSubject: "您的 Crestora Bank 账户已获批准",
    approvedHeadline: "账户已批准",
    approvedBody: "恭喜！您的 Crestora Bank 账户已获批准，现已激活。",
    approvedAccountLabel: "您的账号",
    approvedFooter: "您现在可以登录网上银行了。",
  },
  login: {
    subject: "您的 Crestora Bank 账户有新的登录",
    headline: "安全提醒",
    body: "我们检测到您的 Crestora Bank 网上银行账户有一次新的登录。",
    noAction: "如果是您本人操作，无需任何处理。如果您不认识此活动，请立即联系我们的支持团队。",
  },
  card: {
    subject: "您的新 {cardType} 卡已就绪",
    headline: "卡片已批准",
    body: "您申请的新 {cardType} 卡已获批准并已生成。",
    footer: "您可以在网上银行中安全地查看完整的卡片信息。",
  },
  kyc: {
    approvedSubject: "您的身份已验证",
    approvedHeadline: "身份验证已通过",
    approvedBody: "好消息！您的身份证件已成功通过验证，账户限额已相应更新。",
    rejectedSubject: "需要操作：身份验证未通过",
    rejectedHeadline: "身份验证未通过",
    rejectedBody: "很遗憾，我们无法验证您提交的身份证件。",
    rejectedFooter: "请登录您的账户，重新提交清晰的新证件。",
  },
  security: {
    subject: "安全提醒：{changeType}已变更",
    headline: "安全提醒",
    body: "特此确认，您的<strong>{changeType}</strong>最近已被更改。",
    footer: "如果这不是您本人的操作，请立即联系我们的支持团队以保护您的账户。",
  },
  otp: {
    subject: "您的 Crestora Bank 验证码",
    intro: "您用于 Crestora Bank 账户验证的一次性密码（OTP）为：",
    expiry: "此验证码将在 10 分钟后失效，请勿与任何人分享。",
    ignore: "如果您未申请此验证码，请忽略此邮件。",
    secureVerification: "安全验证",
  },
  passwordReset: {
    subject: "重置您的 Crestora Bank 密码",
    intro: "尊敬的 {name}：我们收到了重置您 Crestora Bank 密码的请求。请使用下方验证码继续操作。如果您未申请重置密码，请忽略此邮件或联系客服。",
  },
  depositRequest: {
    subject: "存款申请已收到 - Crestora Bank",
    headline: "存款申请已收到",
    body: "我们已收到您的存款申请（编号：{depositId}）及相关付款凭证。",
    reviewNote: "我们的团队正在审核您的申请，资金入账后将立即通知您。",
    thanks: "感谢您选择 Crestora Bank。",
  },
  accountFunded: {
    subject: "账户已入账",
    headline: "账户已入账",
    bodyWithSender: "您的账户已收到来自 {sender} 的 {amount} 入账。",
    bodyNoSender: "您的账户已收到 {amount} 入账。",
  },
  supportReply: {
    subject: "来自 Crestora Bank 客服的新消息",
    headline: "客服消息",
    intro: "您收到了来自我们客户服务团队的新消息：",
    footer: "请登录网上银行继续对话。",
  },
  depositRejected: {
    subject: "存款被拒绝 - Crestora Bank",
    headline: "存款被拒绝",
    body: "您的存款申请（编号：{reference}）金额 {amount} 已被拒绝。",
    contactSupport: "如果您认为这是一个错误，请联系我们的支持团队。",
    thanks: "感谢您选择 Crestora Bank。",
  },
};

const ja: PartialStrings = {
  common: {
    dear: "{name} 様",
    hello: "こんにちは。",
    footerAutomated: "このメールは Crestora Bank からの自動送信メッセージです。このメールに直接返信しないでください。",
    footerRights: "無断複写・転載を禁じます。",
    customerSupport: "カスタマーサポート",
    loginButton: "Crestora Bank にログイン",
    supportButton: "カスタマーサポートに問い合わせる",
    unauthorized: "このお取引に心当たりがない場合は、直ちにサポートチームまでご連絡ください。",
    messageFromBank: "Crestora Bank からのお知らせ",
  },
  labels: {
    customer: "お客様",
    referenceNumber: "参照番号",
    transactionType: "取引種別",
    amount: "金額",
    currency: "通貨",
    recipientName: "受取人名",
    recipientBank: "受取銀行",
    recipientAccount: "受取口座",
    paymentDescription: "お支払い内容",
    dateTime: "日時",
    currentStatus: "現在のステータス",
    availableBalance: "利用可能残高",
    transactionSummary: "取引概要",
    conversionSummary: "通貨換算概要",
    senderAmount: "送金額",
    recipientCurrency: "受取通貨",
    exchangeRate: "為替レート",
    transferFee: "送金手数料",
    estRecipientAmount: "受取予定金額",
    rateAppliedOn: "レート適用日",
    newBalance: "新しい残高",
    transactionDetails: "取引明細",
    time: "時刻",
    device: "デバイス",
    webBrowser: "ウェブブラウザ",
    reason: "理由",
    accountNumberLabel: "お客様の口座番号",
    cardEndingIn: "カード番号下4桁",
    reviewDetails: "審査の詳細",
    reviewStatus: "審査状況",
    reviewCaseId: "審査案件ID",
    holdReason: "保留理由",
    estReviewTime: "審査予定時間",
    transactionReference: "取引参照番号",
  },
  status: {
    pending: "処理待ち",
    approved: "承認済み",
    completed: "完了",
    failed: "失敗",
    onHold: "保留中 — 審査中",
    reversed: "取消済み",
    inProgressUnderReview: "処理中 — 審査中",
  },
  txTypes: {
    transfer: "振込",
    internationalTransfer: "海外送金",
    deposit: "入金",
    withdrawal: "出金",
    funding: "口座入金",
  },
  transferStatus: {
    approvedSubject: "お振込が承認されました",
    approvedHeadline: "振込承認",
    approvedBody: "朗報です。お客様のお振込は審査を通過し、承認されました。現在、受取銀行への送金処理を行っています。",
    completedSubject: "お振込が完了しました",
    completedHeadline: "振込完了",
    completedBody: "お振込が正常に完了しました。資金は受取銀行に送金されました。下記の参照番号をお控えください。",
    failedSubject: "お振込を完了できませんでした",
    failedHeadline: "振込失敗",
    failedBody: "誠に恐れ入りますが、お振込を完了できませんでした。全額が利用可能残高に返金され、手数料は発生していません。サポートが必要な場合や再度お手続きをご希望の場合は、カスタマーサポートまでご連絡ください。",
    reversedSubject: "お振込が取り消されました",
    reversedHeadline: "振込取消",
    reversedBody: "お振込が取り消され、全額が利用可能残高に返金されました。この取消に心当たりがない場合は、直ちにカスタマーサポートまでご連絡ください。",
    genericSubject: "振込状況の更新",
    genericHeadline: "振込状況の更新",
    genericBody: "お振込のステータスが「{status}」に更新されました。",
  },
  onHold: {
    subject: "お振込が審査中です — Crestora Bank ITRT",
    headline: "振込審査中",
    intro: "お客様のお振込は、当行の社内セキュリティおよびコンプライアンス手続きの一環として、Crestora Bank の<strong>国際送金審査チーム（ITRT）</strong>による審査のため一時的に保留されています。これはお客様の口座を保護し、お支払いを安全に処理するための通常の手続きです。",
    teamName: "国際送金審査チーム",
    teamDivision: "セキュリティ・コンプライアンス部門 — Crestora Bank",
    whatHappensNext: "今後の流れ",
    whatHappensNextBody: "現在審査を進めており、下記に記載がない限り、直ちに必要なお手続きはございません。審査が完了次第、または追加情報が必要な場合には、自動的にメールでお知らせいたします。",
    whatYouNeedToDo: "お客様にお願いすること",
    step1: "Crestora Bank の口座に安全にログインしてください。",
    step2: "お取引の詳細をご確認ください。",
    step3: "求められた場合は、本人確認のお手続きを完了してください。",
    step4: "ご不明な点はカスタマーサポートまでお問い合わせください。",
  },
  transferPending: {
    subject: "お振込を受け付けました — Crestora Bank",
    headline: "振込受付完了",
    body: "お振込のご依頼を受け付け、現在処理を進めております。下記のお取引詳細をご確認のうえ、参照番号をお控えください。",
    stagesNote: "このお取引の各段階でメールにてお知らせいたします。このお取引に心当たりがない場合は、直ちにサポートチームまでご連絡ください。",
  },
  deposit: {
    subject: "入金のお知らせ — Crestora Bank",
    headline: "入金通知",
    body: "お客様の Crestora Bank 口座に入金がありました。最新の残高は下記のとおりです。",
  },
  withdrawal: {
    subject: "出金処理のお知らせ — Crestora Bank",
    headline: "出金通知",
    body: "お客様の Crestora Bank 口座から出金処理が行われました。詳細は下記のとおりです。",
  },
  registration: {
    receivedSubject: "Crestora Bank 口座開設のお申し込み",
    receivedHeadline: "口座開設申込受付",
    receivedBody1: "Crestora Bank に口座開設をお申し込みいただきありがとうございます。お客様の口座は作成され、現在審査中です。",
    receivedBody2: "<strong>15分から数時間以内</strong>に銀行の承認をお待ちください。口座が承認され次第、確認メールをお送りします。",
    approvedSubject: "Crestora Bank 口座が承認されました",
    approvedHeadline: "口座承認",
    approvedBody: "おめでとうございます。お客様の Crestora Bank 口座が承認され、有効になりました。",
    approvedAccountLabel: "お客様の口座番号",
    approvedFooter: "オンラインバンキングにログインできるようになりました。",
  },
  login: {
    subject: "Crestora Bank 口座への新しいログイン",
    headline: "セキュリティ通知",
    body: "お客様の Crestora Bank オンラインバンキング口座への新しいログインを検出しました。",
    noAction: "ご本人によるものであれば、お手続きは不要です。心当たりのないログインの場合は、直ちにサポートチームまでご連絡ください。",
  },
  card: {
    subject: "新しい {cardType} カードのご用意ができました",
    headline: "カード承認",
    body: "新しい {cardType} カードのお申し込みが承認され、発行されました。",
    footer: "カードの詳細は、オンラインバンキングで安全にご確認いただけます。",
  },
  kyc: {
    approvedSubject: "ご本人確認が完了しました",
    approvedHeadline: "本人確認承認",
    approvedBody: "朗報です。ご提出いただいた本人確認書類の確認が完了しました。口座の利用限度額が更新されました。",
    rejectedSubject: "要対応：本人確認ができませんでした",
    rejectedHeadline: "本人確認失敗",
    rejectedBody: "誠に恐れ入りますが、ご提出いただいた本人確認書類を確認できませんでした。",
    rejectedFooter: "口座にログインし、新しい鮮明な書類を再提出してください。",
  },
  security: {
    subject: "セキュリティ通知：{changeType}が変更されました",
    headline: "セキュリティ通知",
    body: "お客様の<strong>{changeType}</strong>が最近変更されたことをお知らせします。",
    footer: "この変更に心当たりがない場合は、口座の安全を確保するため、直ちにサポートチームまでご連絡ください。",
  },
  otp: {
    subject: "Crestora Bank ワンタイムパスワード",
    intro: "Crestora Bank 口座確認用のワンタイムパスワード（OTP）は次のとおりです：",
    expiry: "このコードは10分後に無効になります。誰にも共有しないでください。",
    ignore: "このコードをリクエストしていない場合は、このメールを無視してください。",
    secureVerification: "安全な認証",
  },
  passwordReset: {
    subject: "Crestora Bank パスワードの再設定",
    intro: "{name} 様、Crestora Bank のパスワード再設定のリクエストを受け付けました。下記の確認コードを使用して手続きを続行してください。心当たりがない場合は、このメールを無視するかサポートまでご連絡ください。",
  },
  depositRequest: {
    subject: "入金リクエスト受付 - Crestora Bank",
    headline: "入金リクエスト受付",
    body: "お客様の入金リクエスト（ID：{depositId}）および関連する支払証明を受け付けました。",
    reviewNote: "現在、チームがリクエストを確認しています。口座への入金が完了次第、お知らせいたします。",
    thanks: "Crestora Bank をご利用いただきありがとうございます。",
  },
  accountFunded: {
    subject: "口座入金のお知らせ",
    headline: "口座入金",
    bodyWithSender: "{sender} 様より {amount} がお客様の口座に入金されました。",
    bodyNoSender: "お客様の口座に {amount} が入金されました。",
  },
  supportReply: {
    subject: "Crestora Bank サポートからの新着メッセージ",
    headline: "サポートメッセージ",
    intro: "カスタマーサポートチームから新しいメッセージが届いています：",
    footer: "オンラインバンキングにログインして、会話を続けてください。",
  },
  depositRejected: {
    subject: "入金却下のお知らせ - Crestora Bank",
    headline: "入金却下",
    body: "お客様の入金リクエスト（ID：{reference}、金額：{amount}）は却下されました。",
    contactSupport: "誤りだと思われる場合は、サポートチームまでご連絡ください。",
    thanks: "Crestora Bank をご利用いただきありがとうございます。",
  },
};

const ko: PartialStrings = {
  common: {
    dear: "{name} 고객님께,",
    hello: "안녕하세요.",
    footerAutomated: "본 메일은 Crestora Bank에서 자동 발송된 메시지입니다. 이 메일에 직접 회신하지 마시기 바랍니다.",
    footerRights: "모든 권리 보유.",
    customerSupport: "고객 지원",
    loginButton: "Crestora Bank 로그인",
    supportButton: "고객 지원팀에 문의하기",
    unauthorized: "본 거래를 승인하지 않으셨다면 즉시 저희 지원팀에 문의해 주시기 바랍니다.",
    messageFromBank: "Crestora Bank에서 보내는 메시지",
  },
  labels: {
    customer: "고객",
    referenceNumber: "참조 번호",
    transactionType: "거래 유형",
    amount: "금액",
    currency: "통화",
    recipientName: "수취인 이름",
    recipientBank: "수취 은행",
    recipientAccount: "수취 계좌",
    paymentDescription: "결제 설명",
    dateTime: "날짜 및 시간",
    currentStatus: "현재 상태",
    availableBalance: "사용 가능 잔액",
    transactionSummary: "거래 요약",
    conversionSummary: "환전 요약",
    senderAmount: "송금 금액",
    recipientCurrency: "수취 통화",
    exchangeRate: "환율",
    transferFee: "이체 수수료",
    estRecipientAmount: "예상 수취 금액",
    rateAppliedOn: "환율 적용일",
    newBalance: "새 잔액",
    transactionDetails: "거래 내역",
    time: "시간",
    device: "기기",
    webBrowser: "웹 브라우저",
    reason: "사유",
    accountNumberLabel: "고객님의 계좌번호",
    cardEndingIn: "카드 번호 끝자리",
    reviewDetails: "심사 세부 정보",
    reviewStatus: "심사 상태",
    reviewCaseId: "심사 사건 ID",
    holdReason: "보류 사유",
    estReviewTime: "예상 심사 시간",
    transactionReference: "거래 참조 번호",
  },
  status: {
    pending: "대기 중",
    approved: "승인됨",
    completed: "완료됨",
    failed: "실패",
    onHold: "보류 — 심사 중",
    reversed: "취소됨",
    inProgressUnderReview: "진행 중 — 심사 중",
  },
  txTypes: {
    transfer: "이체",
    internationalTransfer: "해외 송금",
    deposit: "입금",
    withdrawal: "출금",
    funding: "계좌 입금",
  },
  transferStatus: {
    approvedSubject: "이체가 승인되었습니다",
    approvedHeadline: "이체 승인",
    approvedBody: "좋은 소식입니다! 고객님의 이체가 심사를 통과하여 승인되었습니다. 현재 수취 은행으로 전달하기 위해 처리 중입니다.",
    completedSubject: "이체가 완료되었습니다",
    completedHeadline: "이체 완료",
    completedBody: "이체가 성공적으로 완료되었습니다. 자금이 수취 은행으로 전달되었습니다. 아래 참조 번호를 기록용으로 보관해 주시기 바랍니다.",
    failedSubject: "이체를 완료할 수 없습니다",
    failedHeadline: "이체 실패",
    failedBody: "안타깝게도 이체를 완료할 수 없었습니다. 전액이 사용 가능 잔액으로 반환되었으며 수수료는 부과되지 않았습니다. 도움이 필요하시거나 재시도를 원하시면 고객 지원팀에 문의해 주시기 바랍니다.",
    reversedSubject: "이체가 취소되었습니다",
    reversedHeadline: "이체 취소",
    reversedBody: "이체가 취소되어 전액이 사용 가능 잔액으로 다시 입금되었습니다. 이 취소를 요청하지 않으셨다면 즉시 고객 지원팀에 문의해 주시기 바랍니다.",
    genericSubject: "이체 업데이트",
    genericHeadline: "이체 업데이트",
    genericBody: "이체 상태가 다음으로 업데이트되었습니다: {status}.",
  },
  onHold: {
    subject: "이체가 심사 중입니다 — Crestora Bank ITRT",
    headline: "이체 심사 중",
    intro: "고객님의 이체는 내부 보안 및 규정 준수 절차의 일환으로 Crestora Bank <strong>해외 송금 심사팀(ITRT)</strong>의 심사를 위해 일시적으로 보류되었습니다. 이는 고객님의 계좌를 보호하고 결제가 안전하게 처리되도록 하기 위한 통상적인 절차입니다.",
    teamName: "해외 송금 심사팀",
    teamDivision: "보안 및 규정 준수 부서 — Crestora Bank",
    whatHappensNext: "다음 진행 사항",
    whatHappensNextBody: "현재 심사가 진행 중이며, 아래에 명시되지 않는 한 즉각적인 조치는 필요하지 않습니다. 심사가 완료되거나 추가 정보가 필요한 경우 자동으로 이메일을 보내드립니다.",
    whatYouNeedToDo: "고객님이 하실 일",
    step1: "Crestora Bank 계정에 안전하게 로그인하세요.",
    step2: "거래 세부 정보를 확인하세요.",
    step3: "요청 시 필요한 인증 단계를 완료하세요.",
    step4: "도움이 필요하시면 고객 지원팀에 문의하세요.",
  },
  transferPending: {
    subject: "이체가 접수되었습니다 — Crestora Bank",
    headline: "이체 접수",
    body: "고객님의 이체 지시를 접수하였으며 현재 처리 중입니다. 아래에서 거래의 전체 세부 정보를 확인하시고 참조 번호를 기록용으로 보관해 주시기 바랍니다.",
    stagesNote: "본 거래의 각 단계마다 이메일로 알려드립니다. 본 거래를 승인하지 않으셨다면 즉시 저희 지원팀에 문의해 주시기 바랍니다.",
  },
  deposit: {
    subject: "입금 완료 — Crestora Bank",
    headline: "입금 알림",
    body: "고객님의 Crestora Bank 계좌에 입금이 완료되었습니다. 업데이트된 잔액은 아래와 같습니다.",
  },
  withdrawal: {
    subject: "출금 처리 완료 — Crestora Bank",
    headline: "출금 알림",
    body: "고객님의 Crestora Bank 계좌에서 출금이 처리되었습니다. 세부 정보는 아래와 같습니다.",
  },
  registration: {
    receivedSubject: "Crestora Bank 계좌 개설 신청",
    receivedHeadline: "계좌 개설 신청 접수",
    receivedBody1: "Crestora Bank에 계좌를 개설해 주셔서 감사합니다. 고객님의 계좌가 생성되었으며 현재 심사 중입니다.",
    receivedBody2: "<strong>15분에서 몇 시간 이내</strong>에 은행 승인을 기다려 주시기 바랍니다. 계좌가 승인되면 확인 이메일을 보내드립니다.",
    approvedSubject: "Crestora Bank 계좌가 승인되었습니다",
    approvedHeadline: "계좌 승인",
    approvedBody: "축하합니다! 고객님의 Crestora Bank 계좌가 승인되어 활성화되었습니다.",
    approvedAccountLabel: "고객님의 계좌번호",
    approvedFooter: "이제 온라인 뱅킹에 로그인하실 수 있습니다.",
  },
  login: {
    subject: "Crestora Bank 계정에 새로운 로그인 발생",
    headline: "보안 알림",
    body: "고객님의 Crestora Bank 온라인 뱅킹 계정에서 새로운 로그인이 감지되었습니다.",
    noAction: "본인이 맞으시다면 별도의 조치가 필요하지 않습니다. 본인의 활동이 아니라면 즉시 저희 지원팀에 문의해 주시기 바랍니다.",
  },
  card: {
    subject: "새 {cardType} 카드가 준비되었습니다",
    headline: "카드 승인",
    body: "새 {cardType} 카드 신청이 승인되어 발급되었습니다.",
    footer: "온라인 뱅킹에서 카드 세부 정보를 안전하게 확인하실 수 있습니다.",
  },
  kyc: {
    approvedSubject: "신원 확인이 완료되었습니다",
    approvedHeadline: "신원 확인 승인",
    approvedBody: "좋은 소식입니다! 제출하신 신분증명서가 성공적으로 확인되었습니다. 계좌 한도가 그에 따라 업데이트되었습니다.",
    rejectedSubject: "조치 필요: 신원 확인 실패",
    rejectedHeadline: "신원 확인 실패",
    rejectedBody: "안타깝게도 제출하신 신분증명서를 확인할 수 없었습니다.",
    rejectedFooter: "계정에 로그인하여 선명한 새 서류를 다시 제출해 주시기 바랍니다.",
  },
  security: {
    subject: "보안 알림: {changeType} 변경됨",
    headline: "보안 알림",
    body: "고객님의 <strong>{changeType}</strong>이(가) 최근 변경되었음을 확인드립니다.",
    footer: "본인이 변경하지 않으셨다면 계정 보호를 위해 즉시 저희 지원팀에 문의해 주시기 바랍니다.",
  },
  otp: {
    subject: "Crestora Bank OTP 코드",
    intro: "Crestora Bank 계정 인증을 위한 일회용 비밀번호(OTP)는 다음과 같습니다:",
    expiry: "이 코드는 10분 후에 만료됩니다. 이 코드를 누구와도 공유하지 마세요.",
    ignore: "이 코드를 요청하지 않으셨다면 이 이메일을 무시해 주시기 바랍니다.",
    secureVerification: "보안 인증",
  },
  passwordReset: {
    subject: "Crestora Bank 비밀번호 재설정",
    intro: "{name} 고객님, Crestora Bank 비밀번호 재설정 요청을 접수했습니다. 아래 인증 코드를 사용하여 계속 진행해 주세요. 재설정을 요청하지 않으셨다면 이 이메일을 무시하거나 지원팀에 문의해 주시기 바랍니다.",
  },
  depositRequest: {
    subject: "입금 요청 접수 - Crestora Bank",
    headline: "입금 요청 접수",
    body: "고객님의 입금 요청(ID: {depositId})과 관련 결제 증빙을 접수하였습니다.",
    reviewNote: "저희 팀이 현재 요청을 검토하고 있습니다. 자금이 계좌에 입금되는 대로 알려드리겠습니다.",
    thanks: "Crestora Bank를 이용해 주셔서 감사합니다.",
  },
  accountFunded: {
    subject: "계좌 입금 완료",
    headline: "계좌 입금",
    bodyWithSender: "{sender}님으로부터 {amount}이(가) 고객님의 계좌에 입금되었습니다.",
    bodyNoSender: "고객님의 계좌에 {amount}이(가) 입금되었습니다.",
  },
  supportReply: {
    subject: "Crestora Bank 고객 지원팀의 새 메시지",
    headline: "고객 지원 메시지",
    intro: "고객 지원팀으로부터 새 메시지가 도착했습니다:",
    footer: "온라인 뱅킹에 로그인하여 대화를 계속하세요.",
  },
  depositRejected: {
    subject: "입금 거절 - Crestora Bank",
    headline: "입금 거절",
    body: "고객님의 입금 요청(ID: {reference}, 금액: {amount})이 거절되었습니다.",
    contactSupport: "오류라고 생각되시면 저희 지원팀에 문의해 주시기 바랍니다.",
    thanks: "Crestora Bank를 이용해 주셔서 감사합니다.",
  },
};

const ru: PartialStrings = {
  common: {
    dear: "Уважаемый(ая) {name},",
    hello: "Здравствуйте,",
    footerAutomated: "Это автоматическое сообщение от Crestora Bank. Пожалуйста, не отвечайте на это письмо напрямую.",
    footerRights: "Все права защищены.",
    customerSupport: "Служба поддержки",
    loginButton: "Войти в Crestora Bank",
    supportButton: "Связаться со службой поддержки",
    unauthorized: "Если вы не совершали эту операцию, немедленно свяжитесь с нашей службой поддержки.",
    messageFromBank: "Сообщение от Crestora Bank",
  },
  labels: {
    customer: "Клиент",
    referenceNumber: "Номер ссылки",
    transactionType: "Тип операции",
    amount: "Сумма",
    currency: "Валюта",
    recipientName: "Имя получателя",
    recipientBank: "Банк получателя",
    recipientAccount: "Счёт получателя",
    paymentDescription: "Назначение платежа",
    dateTime: "Дата и время",
    currentStatus: "Текущий статус",
    availableBalance: "Доступный баланс",
    transactionSummary: "Сводка операции",
    conversionSummary: "Сводка конвертации валют",
    senderAmount: "Сумма отправителя",
    recipientCurrency: "Валюта получателя",
    exchangeRate: "Обменный курс",
    transferFee: "Комиссия за перевод",
    estRecipientAmount: "Ориентировочная сумма к получению",
    rateAppliedOn: "Курс применён",
    newBalance: "Новый баланс",
    transactionDetails: "Детали операции",
    time: "Время",
    device: "Устройство",
    webBrowser: "Веб-браузер",
    reason: "Причина",
    accountNumberLabel: "Номер вашего счёта",
    cardEndingIn: "Карта с окончанием",
    reviewDetails: "Детали проверки",
    reviewStatus: "Статус проверки",
    reviewCaseId: "Номер дела проверки",
    holdReason: "Причина удержания",
    estReviewTime: "Ориентировочное время проверки",
    transactionReference: "Ссылка на операцию",
  },
  status: {
    pending: "В обработке",
    approved: "Одобрено",
    completed: "Завершено",
    failed: "Не выполнено",
    onHold: "Приостановлено — на проверке",
    reversed: "Отменено",
    inProgressUnderReview: "Выполняется — на проверке",
  },
  txTypes: {
    transfer: "Перевод",
    internationalTransfer: "Международный перевод",
    deposit: "Пополнение",
    withdrawal: "Снятие",
    funding: "Зачисление на счёт",
  },
  transferStatus: {
    approvedSubject: "Ваш перевод одобрен",
    approvedHeadline: "Перевод одобрен",
    approvedBody: "Хорошие новости! Ваш перевод прошёл проверку и был одобрен. Сейчас он обрабатывается для доставки в банк получателя.",
    completedSubject: "Ваш перевод завершён",
    completedHeadline: "Перевод завершён",
    completedBody: "Ваш перевод успешно завершён. Средства доставлены в банк получателя. Пожалуйста, сохраните номер ссылки ниже для ваших записей.",
    failedSubject: "Ваш перевод не удалось выполнить",
    failedHeadline: "Перевод не выполнен",
    failedBody: "К сожалению, ваш перевод не удалось выполнить. Вся сумма возвращена на ваш доступный баланс. Комиссия не взималась. Свяжитесь со службой поддержки, если вам нужна помощь или вы хотите повторить платёж.",
    reversedSubject: "Ваш перевод отменён",
    reversedHeadline: "Перевод отменён",
    reversedBody: "Ваш перевод был отменён, и вся сумма возвращена на ваш доступный баланс. Если вы не запрашивали эту отмену, немедленно свяжитесь со службой поддержки.",
    genericSubject: "Обновление перевода",
    genericHeadline: "Обновление перевода",
    genericBody: "Статус вашего перевода обновлён: {status}.",
  },
  onHold: {
    subject: "Ваш перевод на проверке — Crestora Bank ITRT",
    headline: "Перевод на проверке",
    intro: "Ваш перевод временно передан на проверку <strong>Команде проверки международных переводов (ITRT)</strong> Crestora Bank в рамках наших внутренних процедур безопасности и комплаенса. Это стандартная процедура, предназначенная для защиты вашего счёта и безопасной обработки платежа.",
    teamName: "Команда проверки международных переводов",
    teamDivision: "Департамент безопасности и комплаенса — Crestora Bank",
    whatHappensNext: "Что будет дальше",
    whatHappensNextBody: "Проверка выполняется, и никаких немедленных действий не требуется, если ниже не указано иное. Вы автоматически получите следующее письмо, как только проверка будет завершена или если потребуется дополнительная информация.",
    whatYouNeedToDo: "Что вам нужно сделать",
    step1: "Безопасно войдите в свой аккаунт Crestora Bank.",
    step2: "Проверьте детали операции.",
    step3: "При необходимости выполните запрошенные шаги верификации.",
    step4: "Свяжитесь со службой поддержки, если нужна помощь.",
  },
  transferPending: {
    subject: "Ваш перевод отправлен — Crestora Bank",
    headline: "Перевод отправлен",
    body: "Мы получили ваше поручение на перевод, и оно обрабатывается. Пожалуйста, проверьте полные детали вашей операции ниже и сохраните номер ссылки для ваших записей.",
    stagesNote: "Вы будете получать уведомления по электронной почте на каждом этапе этой операции. Если вы не совершали эту операцию, немедленно свяжитесь с нашей службой поддержки.",
  },
  deposit: {
    subject: "Пополнение получено — Crestora Bank",
    headline: "Уведомление о пополнении",
    body: "На ваш счёт в Crestora Bank зачислено пополнение. Ваш обновлённый баланс указан ниже.",
  },
  withdrawal: {
    subject: "Снятие обработано — Crestora Bank",
    headline: "Уведомление о снятии",
    body: "Со счёта в Crestora Bank обработано снятие средств. Детали ниже.",
  },
  registration: {
    receivedSubject: "Ваша заявка на открытие счёта в Crestora Bank",
    receivedHeadline: "Заявка на счёт получена",
    receivedBody1: "Благодарим вас за открытие счёта в Crestora Bank. Ваш счёт создан и в настоящее время находится на проверке.",
    receivedBody2: "Пожалуйста, дождитесь одобрения банка в течение <strong>15 минут — нескольких часов</strong>. После одобрения счёта вы получите письмо с подтверждением.",
    approvedSubject: "Ваш счёт в Crestora Bank одобрен",
    approvedHeadline: "Счёт одобрен",
    approvedBody: "Поздравляем! Ваш счёт в Crestora Bank одобрен и теперь активен.",
    approvedAccountLabel: "Номер вашего счёта",
    approvedFooter: "Теперь вы можете войти в интернет-банк.",
  },
  login: {
    subject: "Новый вход в ваш аккаунт Crestora Bank",
    headline: "Оповещение безопасности",
    body: "Мы обнаружили новый вход в ваш аккаунт интернет-банка Crestora Bank.",
    noAction: "Если это были вы, никаких действий не требуется. Если вы не узнаёте эту активность, немедленно свяжитесь с нашей службой поддержки.",
  },
  card: {
    subject: "Ваша новая карта {cardType} готова",
    headline: "Карта одобрена",
    body: "Ваш запрос на новую карту {cardType} одобрен, карта выпущена.",
    footer: "Вы можете безопасно просмотреть полные данные карты в интернет-банке.",
  },
  kyc: {
    approvedSubject: "Ваша личность подтверждена",
    approvedHeadline: "Проверка личности одобрена",
    approvedBody: "Хорошие новости! Ваши документы, удостоверяющие личность, успешно проверены. Лимиты вашего счёта соответственно обновлены.",
    rejectedSubject: "Требуется действие: проверка личности не пройдена",
    rejectedHeadline: "Проверка личности не пройдена",
    rejectedBody: "К сожалению, мы не смогли проверить предоставленные вами документы, удостоверяющие личность.",
    rejectedFooter: "Пожалуйста, войдите в свой аккаунт и загрузите новые чёткие документы.",
  },
  security: {
    subject: "Оповещение безопасности: изменён {changeType}",
    headline: "Оповещение безопасности",
    body: "Подтверждаем, что ваш <strong>{changeType}</strong> был недавно изменён.",
    footer: "Если вы не вносили это изменение, немедленно свяжитесь с нашей службой поддержки, чтобы защитить свой аккаунт.",
  },
  otp: {
    subject: "Ваш OTP-код Crestora Bank",
    intro: "Ваш одноразовый пароль (OTP) для подтверждения аккаунта Crestora Bank:",
    expiry: "Срок действия кода истекает через 10 минут. Не сообщайте этот код никому.",
    ignore: "Если вы не запрашивали этот код, просто проигнорируйте это письмо.",
    secureVerification: "Безопасная верификация",
  },
  passwordReset: {
    subject: "Сброс пароля Crestora Bank",
    intro: "Уважаемый(ая) {name}, мы получили запрос на сброс вашего пароля Crestora Bank. Используйте код подтверждения ниже, чтобы продолжить. Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь со службой поддержки.",
  },
  depositRequest: {
    subject: "Запрос на пополнение получен - Crestora Bank",
    headline: "Запрос на пополнение получен",
    body: "Мы получили ваш запрос на пополнение (ID: {depositId}) и приложенное подтверждение платежа.",
    reviewNote: "Наша команда рассматривает ваш запрос. Мы уведомим вас, как только средства будут зачислены на ваш счёт.",
    thanks: "Благодарим вас за то, что вы с Crestora Bank.",
  },
  accountFunded: {
    subject: "Счёт пополнен",
    headline: "Счёт пополнен",
    bodyWithSender: "Ваш счёт пополнен на {amount} от {sender}.",
    bodyNoSender: "Ваш счёт пополнен на {amount}.",
  },
  supportReply: {
    subject: "Новое сообщение от службы поддержки Crestora Bank",
    headline: "Сообщение от поддержки",
    intro: "Вы получили новое сообщение от нашей службы поддержки клиентов:",
    footer: "Войдите в интернет-банк, чтобы продолжить разговор.",
  },
  depositRejected: {
    subject: "Пополнение отклонено - Crestora Bank",
    headline: "Пополнение отклонено",
    body: "Ваш запрос на пополнение (ID: {reference}) на сумму {amount} был отклонён.",
    contactSupport: "Если вы считаете, что это ошибка, свяжитесь с нашей службой поддержки.",
    thanks: "Благодарим вас за то, что вы с Crestora Bank.",
  },
};

export const TRANSLATIONS: { en: EmailStrings } & Record<string, PartialStrings> = {
  en,
  es,
  fr,
  pt,
  de,
  it,
  nl,
  ar,
  zh,
  ja,
  ko,
  ru,
};
