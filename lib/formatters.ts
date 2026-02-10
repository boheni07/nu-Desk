/**
 * 전화번호 및 휴대폰 번호 포맷팅 (숫자만 추출 후 하이픈 삽입)
 * 02-0000-0000, 010-0000-0000 등 한국 표준 형식 대응
 */
export const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

    // 서울 지역번호 (02)
    if (digits.startsWith('02')) {
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
        if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
        return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }

    // 일반 지역번호 및 휴대폰 (010, 031, 062 등)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

/**
 * 사업자등록번호 포맷팅 (000-00-00000)
 */
export const formatBizNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

/**
 * 이메일 유효성 검사 (기본 정규식)
 */
export const isValidEmail = (email: string): boolean => {
    if (!email) return true; // 빈 값은 허용 (필수값이 아닐 경우)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
