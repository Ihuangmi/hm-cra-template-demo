export interface RemarkList {
  userType: number;
  auditComment: string;
  submitUser: string;
  submitUserDisplay: string;
  auditTime: string;
  pointTime: string;
  desc: string;
}
export interface AuditUserList {
  user: string;
  userDisplay: string;
  auditTime: string;
  status: number;
}

export interface PreOrNext {
  id: number;
  isExist: boolean;
}

export interface AuditDetailData {
  id: number;
  materialType: string;
  fileUrl: string;
  posterUrl: string;
  materialName: string;
  outAuditCode: string;
  submitUser: string;
  submitUserDisplay: string;
  auditUser: string;
  auditUserDisplay: string;
  inAuditUser: string;
  inAuditUserDisplay: string;
  outAuditUser: string;
  outAuditUserDisplay: string;
  createTime: string;
  innerStatus: number;
  outStatus: number;
  auditStatus: number;
  versionId: number;
  remarkList: RemarkList[];
  auditUserList: AuditUserList[];
  pre: PreOrNext;
  next: PreOrNext;
  fileSize: number;
  width: string;
  height: string;
  outHeadImgUrl: string;
  duration: number;
  auditTime: string;
}
