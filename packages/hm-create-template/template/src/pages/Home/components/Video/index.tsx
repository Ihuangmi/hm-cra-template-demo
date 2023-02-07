import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import classNames from 'classnames';
import Player from 'xgplayer';
import styles from './index.module.less';
import { DotLoading, Button, Dialog, TextArea, Toast, Popup, Image, Skeleton } from 'antd-mobile';
import { CheckCircleFill, CloseCircleFill } from 'antd-mobile-icons';
import { format, convertToSeconds, bytesToSize } from '@/utils';
import { ReactComponent as DetailSvg } from './imgs/detail.svg';
import { reqAuditingDetail, reqAuditingAudit, reqAuditingAddRemark } from '@/api';
import { AuditDetailData, RemarkList } from '../../typings';
import memoryConfig from '@/utils/memoryConfig';

let _player: any = null;

interface AuditStatus {
  [index: number]: {
    text: string;
    color: string;
  };
}

export const AUDIT_STATUS: AuditStatus = {
  0: {
    text: '-',
    color: '',
  },
  1: {
    text: '审核中',
    color: '#2998FF',
  },
  2: {
    text: '审核通过',
    color: '#00b354',
  },
  3: {
    text: '审核不通过',
    color: '#ff401a',
  },
  4: {
    text: '已撤销',
    color: '#afb6b6',
  },
  5: {
    text: '未开始',
    color: '#afb6b6',
  },
};

const Video: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isOutAudit = isNaN(Number(id)); // 区分内外审，内审参数为数字，外审为字符串

  //PC端打开此页面，跳转至PC端审核页面
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent)) {
    window.location.href = isOutAudit ? `${window.location.origin}/feed/common/audit/${id}` : memoryConfig.audit;
  }

  const [currentTime, setCurrentTime] = useState<number>(0); // 视频播放时长
  const [inputFocus, setInputFocus] = useState<boolean>(false); // 输入框foucs
  const [initSuccess, setInitSuccess] = useState<boolean>(false); // 初始化页面是否完成

  const [messageList, setMessageList] = useState<{ time: string; text: string }[]>([]); // 留言记录

  const [message, setMessage] = useState<string>('');
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const [detail, setDetail] = useState<AuditDetailData>();
  const [progressDot, setProgressDot] = useState<{ time: number }[]>([]);

  const getDetailData = async () => {
    let res = await reqAuditingDetail({
      [isOutAudit ? 'outAuditCode' : 'flowId']: id,
    });

    if (res?.result) {
      setInitSuccess(true);
      setDetail(res?.result);
      setMessageList(
        res?.result?.remarkList.map((v: RemarkList) => ({
          time: v.pointTime,
          text: v.auditComment,
        })),
      );
      setProgressDot(
        res?.result?.remarkList.map((v: RemarkList) => ({
          time: convertToSeconds(v.pointTime),
        })),
      );
    }
  };

  useEffect(() => {
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (_player) {
      _player?.destroy(true);
    }
    if (detail?.materialType === 'VIDEO' && !_player) {
      _player = new Player({
        id: 'playBox',
        url: detail?.fileUrl || '',
        playbackRate: [0.5, 0.75, 1, 1.5, 2],
        playsinline: true,
        autoplay: true,
        // cssFullscreen: true,
        fitVideoSize: 'fixHeight',
        lang: 'zh-cn',
        ignores: ['play', 'volume'],
        'x5-video-player-type': 'h5',
        'x5-video-player-fullscreen': true,
        'x5-video-orientation': 'portraint',
        progressDot: progressDot,
      });

      // 播放时间改变
      _player?.on('timeupdate', () => {
        setCurrentTime(_player?.currentTime);
      });
    }
    return () => {
      _player = null;
    };
  }, [detail?.fileUrl, detail?.materialType, progressDot]);

  function onInputFocus() {
    setInputFocus(true);
    _player?.pause();
  }

  /**
   * 取消留言
   */
  function handleCancelMessage() {
    setMessage('');
    setInputFocus(false);
    _player?.play();
  }

  /**
   * 留言
   */
  async function handleMessage() {
    const data = {
      versionId: detail?.versionId,
      [isOutAudit ? 'outAuditCode' : 'flowId']: id,
      remarkList: [{ pointTime: format(currentTime), desc: message }],
    };
    const res = await reqAuditingAddRemark(data);
    if (res?.success) {
      Toast.show({
        content: '留言成功',
      });
      _player && _player.addProgressDot(currentTime);
      setMessageList([...messageList, { time: format(currentTime), text: message }]);
      setMessage('');
      setInputFocus(false);
      setTextLoading(false);
      _player && _player?.play();
    }
  }

  /**
   * 驳回
   */
  function handleReject() {
    Dialog.confirm({
      content: '是否确认驳回审核',
      onConfirm: async () => {
        if (!messageList.length) {
          Toast.show({
            icon: 'fail',
            content: '请在留言处输入驳回原因',
          });
          return;
        }
        const params = {
          status: 0,
          versionId: detail?.versionId,
          [isOutAudit ? 'outAuditCode' : 'flowId']: id,
        };
        const res = await reqAuditingAudit(params);
        if (res?.success) {
          Toast.show({
            icon: 'success',
            content: '驳回审核成功',
          });
          location.reload();
        }
      },
    });
  }

  /**
   * 通过
   */
  function handlePass() {
    Dialog.confirm({
      content: '是否确认通过审核',
      onConfirm: async () => {
        const params = {
          status: 1,
          versionId: detail?.versionId,
          [isOutAudit ? 'outAuditCode' : 'flowId']: id,
        };
        const res = await reqAuditingAudit(params);
        if (res?.success) {
          Toast.show({
            icon: 'success',
            content: '通过审核成功',
          });
          location.reload();
        }
      },
    });
  }

  return (
    <>
      {detail ? (
        <>
          <DetailSvg className={styles.svg} onClick={() => setVisible(true)} />
          {!initSuccess && <Skeleton animated style={{ '--height': '100%' }} />}
          {detail?.materialType === 'IMAGE' ? (
            <div className={classNames(styles.palyBox, 'tw-w-full ')}>
              <Image src={detail?.fileUrl} fit="contain" className="tw-w-[100%] tw-h-[100%]" />
            </div>
          ) : (
            <div id="playBox" className={classNames(styles.palyBox, 'tw-w-full')}></div>
          )}
          <div className={styles.footer}>
            <div className={classNames(styles.textBox, 'tw-flex tw-flex-col')}>
              {!inputFocus && messageList.length > 0 && (
                <dl className={classNames(styles.list, 'tw-m-0 tw-flex-1 tw-overflow-y-auto')}>
                  {messageList.map((item, index) => (
                    <dd className="tw-flex tw-items-center tw-m-0 tw-py-2px" key={item.text + index}>
                      {detail?.materialType === 'VIDEO' && <span className="tw-mr-16px">{item.time}</span>}
                      <div className="text">{item.text}</div>
                    </dd>
                  ))}
                </dl>
              )}
              {detail[isOutAudit ? 'outStatus' : 'innerStatus'] === 1 && (
                <div
                  className={classNames(
                    styles.inputBox,
                    'tw-flex tw-py-2px',
                    inputFocus || !messageList.length ? 'tw-border-none' : '',
                  )}
                >
                  {detail?.materialType === 'VIDEO' && (
                    <span className="tw-mr-16px tw-text-[#727FFF]">{format(currentTime)}</span>
                  )}
                  <TextArea
                    value={message}
                    placeholder="请在这里输入你的审核意见"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    rows={!inputFocus && messageList.length ? 1 : 3}
                    style={{ '--font-size': '14px' }}
                    onFocus={onInputFocus}
                    onChange={setMessage}
                  />
                </div>
              )}
            </div>
            {detail[isOutAudit ? 'outStatus' : 'innerStatus'] === 1 && (
              <div className="tw-flex tw-mt-14px">
                {!inputFocus ? (
                  <>
                    <Button block shape="rounded" onClick={handleReject}>
                      驳回
                    </Button>
                    <Button block shape="rounded" color="primary" className="tw-ml-12px" onClick={handlePass}>
                      通过
                    </Button>
                  </>
                ) : (
                  <>
                    <Button block shape="rounded" onClick={handleCancelMessage}>
                      取消
                    </Button>
                    <Button
                      block
                      shape="rounded"
                      color="primary"
                      onClick={handleMessage}
                      disabled={!message?.length}
                      loading={textLoading}
                      className="tw-ml-12px"
                    >
                      留言
                    </Button>
                  </>
                )}
              </div>
            )}
            <div className="tw-flex tw-justify-end">
              {detail[isOutAudit ? 'outStatus' : 'innerStatus'] === 2 && (
                <div className={styles.statusBtn}>
                  <CheckCircleFill className="tw-text-[#00B354] " />
                  已通过
                </div>
              )}
              {detail[isOutAudit ? 'outStatus' : 'innerStatus'] === 3 && (
                <div className={styles.statusBtn}>
                  <CloseCircleFill className="tw-text-[#FF401A]" />
                  已驳回
                </div>
              )}
              {detail[isOutAudit ? 'outStatus' : 'innerStatus'] === 4 && (
                <div className={styles.statusBtn}>
                  <CloseCircleFill className="tw-text-[#889191]" />
                  已撤销
                </div>
              )}
            </div>
          </div>

          <Popup
            visible={visible}
            onMaskClick={() => {
              setVisible(false);
            }}
            bodyStyle={{
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              minHeight: '40vh',
            }}
          >
            <>
              <div className={classNames(styles.infoHeader, 'tw-p-20px tw-font-bold')}>基本信息</div>
              <div className="tw-p-20px tw-leading-loose ">
                <div>
                  <span className={styles.infoTitle}>任务ID：</span>
                  <span>{detail?.id}</span>
                </div>

                <div>
                  <span className={styles.infoTitle}>资产名称：</span>
                  <span>{detail?.materialName}</span>
                </div>
                <div>
                  <span className={styles.infoTitle}>资产类型：</span>
                  <span>{detail?.materialType === 'IMAGE' ? '图片' : '视频'}</span>
                </div>
                <div>
                  <span className={styles.infoTitle}>素材大小：</span>
                  <span>{bytesToSize(detail?.fileSize || 0)}</span>
                </div>
                <div>
                  <span className={styles.infoTitle}>素材尺寸：</span>
                  <span>
                    {detail?.width} * {detail?.height}
                  </span>
                </div>
                {detail?.materialType === 'VIDEO' && (
                  <div>
                    <span className={styles.infoTitle}>视频时长：</span>
                    <span>{format(detail?.duration / 1000)}</span>
                  </div>
                )}
                <div>
                  <span className={styles.infoTitle}>创建人：</span>
                  <span>{detail?.submitUserDisplay}</span>
                </div>
                <div>
                  <span className={styles.infoTitle}>创建任务时间：</span>
                  <span>{detail?.createTime}</span>
                </div>
                <div>
                  <span className={styles.infoTitle}>当前审核状态：</span>
                  <span>{AUDIT_STATUS[detail[isOutAudit ? 'outStatus' : 'innerStatus'] || 0]?.text}</span>
                </div>
              </div>
            </>
          </Popup>
        </>
      ) : (
        <DotLoading />
      )}
    </>
  );
};

export default React.memo(Video);
