// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Preset theo thể loại văn bản: cùng một câu, đúng ở tin nhắn nhưng sai ở công văn.
// Preset chỉ chỉnh MỨC NGHIÊM TRỌNG và ngưỡng chữ; không thêm quy tắc mới ngoài danh mục.

export const PRESETS = {
  'cong-van': {
    label: 'Công văn, tờ trình, quyết định',
    minWords: 40,
    rules: {
      XH01: 'error', VI41: 'error', VI40: 'error', VS02: 'error', VI07: 'error', VI14: 'error', VI13: 'error',
      VI02: 'error', VI03: 'error', VI06: 'error', VI51: 'error', CT05: 'error', CT08: 'warning',
    },
  },
  email: {
    label: 'Email công việc',
    minWords: 30,
    rules: { VI03: 'error', VI06: 'error', VI02: 'error', VI41: 'error', VS04: 'info' },
  },
  'bao-cao': {
    label: 'Báo cáo cho lãnh đạo',
    rules: { VI04: 'error', VI27: 'error', VI12: 'error', VI01: 'error', CT05: 'error', CT08: 'warning', VS03: 'info' },
  },
  'thong-bao': {
    label: 'Thông báo nội bộ',
    minWords: 30,
    rules: { VI12: 'error', VI13: 'error', VI06: 'error', VS04: 'error' },
  },
  'tin-nhan': {
    label: 'Tin nhắn Zalo / chat',
    minWords: 15,
    rules: { VS04: 'error', VS02: 'error', VI41: 'warning', VS03: 'off', CT04: 'off', CT08: 'off' },
  },
  'gioi-thieu': {
    label: 'Bài giới thiệu, bán hàng',
    rules: { VI13: 'error', VI15: 'error', VI33: 'error', VI16: 'error', VI11: 'error' },
  },
  'huong-dan': {
    label: 'Hướng dẫn sử dụng',
    rules: { VI29: 'error', VI26: 'error', VI22: 'error', VS03: 'off' },
  },
};

export const SEVERITIES = ['off', 'info', 'warning', 'error'];
