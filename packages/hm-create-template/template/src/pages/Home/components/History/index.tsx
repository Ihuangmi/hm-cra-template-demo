import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Card, Popup, Skeleton, Tabs, Empty, Image } from 'antd-mobile';
import { EyeOutline, PictureOutline } from 'antd-mobile-icons';
import Player from 'xgplayer';
import { useParams } from 'react-router';
import { convertToSeconds } from '@/utils';
import { reqAuditingHistory } from '@/api';
import { RemarkList } from '../../typings';
import styles from './index.module.less';

interface RecordType {
  materialType: 'VIDEO' | 'IMAGE';
  fileUrl: string;
  remarkList: RemarkList[];
  versionId: number;
  userType: number;
}

let _player: any = null;

const tabItems = [
  { key: '1', title: '内审' },
  { key: '2', title: '外审' },
];

const History: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isOutAudit = isNaN(Number(id)); // 区分内外审，内审参数为数字，外审为字符串

  const [visible, setVisible] = useState<boolean>(false);
  const [initSuccess, setInitSuccess] = useState<boolean>(false); // 初始化视频展示有延迟,设置初始化成功状态解决延迟问题
  const [activeIndex, setActiveIndex] = useState(0); // 同userType 0: 内审 1：外审

  const [record, setRecord] = useState<RecordType[][]>([]);
  const [actIndex, setActIndex] = useState<number>(0); // 当前点击素材版本
  const [actVersion, setActVersion] = useState<RecordType>();
  const [pointTime, setPointTime] = useState<string>();
  const [progressDot, setProgressDot] = useState<{ time: number }[]>([]);

  useEffect(() => {
    isOutAudit && setActiveIndex(1);
  }, [isOutAudit]);

  const getDetailData = async () => {
    let res = await reqAuditingHistory({
      [isOutAudit ? 'outAuditCode' : 'flowId']: id,
    });
    if (res?.result) {
      let allRecord = [];
      allRecord[0] = res?.result.filter((v: RecordType) => v.userType === 0);
      allRecord[1] = res?.result.filter((v: RecordType) => v.userType === 1);
      setRecord(allRecord);
    }
  };

  useEffect(() => {
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 初始化视频
   */
  function initPlay() {
    _player = new Player({
      id: 'playHisBox',
      url: actVersion?.fileUrl || '',
      playbackRate: [0.5, 0.75, 1, 1.5, 2],
      playsinline: true,
      autoplay: true,
      cssFullscreen: false,
      fitVideoSize: 'auto',
      lang: 'zh-cn',
      ignores: ['fullscreen', 'play', 'volume'],
      'x5-video-player-type': 'h5',
      'x5-video-player-fullscreen': true,
      'x5-video-orientation': 'portraint',
      lastPlayTime: convertToSeconds(pointTime),
      progressDot: progressDot,
    });
    setInitSuccess(true);
  }

  /**
   * 打开历史视频
   */
  function handleOpenHis(version: RecordType, index: number, point?: string) {
    setVisible(true);
    setActIndex(index);
    setActVersion(version);
    point && setPointTime(point);

    const dots =
      version?.remarkList
        ?.map((v) => ({
          time: convertToSeconds(v.pointTime),
        }))
        .filter((v) => v) || [];
    setProgressDot(dots);
  }

  return (
    <>
      {!isOutAudit && (
        <div
          className={classNames(
            styles.tabsWrapper,
            'tw-w-136px tw-h-36px tw-bg-[#E1E6E6] tw-rounded-[20px] tw-mx-auto tw-mt-16px',
          )}
        >
          <Tabs
            style={{
              '--title-font-size': '14px',
              '--active-line-border-radius': '20px',
              '--active-line-height': '0px',
            }}
            activeKey={tabItems[activeIndex].key}
            onChange={(key) => {
              const index = tabItems.findIndex((item) => item.key === key);
              setActiveIndex(index);
            }}
          >
            {tabItems.map((item) => (
              <Tabs.Tab title={item.title} key={item.key} />
            ))}
          </Tabs>
        </div>
      )}
      <div className={styles.historyContainer}>
        {record[activeIndex]?.length > 0 ? (
          record[activeIndex]
            // .filter((v) => v.userType === activeIndex)
            .map((card, index) => (
              <Card
                key={card.versionId}
                title={
                  <>
                    {index === 0 ? '当前版本' : `历史版本${index}`}{' '}
                    {card?.materialType === 'IMAGE' ? (
                      <PictureOutline onClick={() => handleOpenHis(card, index)} className={styles.icons} />
                    ) : (
                      <EyeOutline onClick={() => handleOpenHis(card, index)} className={styles.icons} />
                    )}
                  </>
                }
                className={classNames(styles.cardWrapper)}
              >
                {card?.remarkList.map((remark, i) => (
                  <div key={remark.submitUser + i} className="tw-leading-loose">
                    <div>
                      {remark.submitUserDisplay}，{remark.auditTime} {remark.desc}
                    </div>
                    {remark.auditComment ? (
                      <div className="tw-bg-[#F7FAFA] tw-text-[#626A6A] tw-text-sm tw-p-5px">
                        {card?.materialType === 'VIDEO' ? (
                          <div>
                            {remark.pointTime} {remark.auditComment}{' '}
                            <a
                              className="tw-text-[#0088FF]"
                              onClick={() => handleOpenHis(card, index, remark.pointTime)}
                            >
                              定位到这＞
                            </a>
                          </div>
                        ) : (
                          <div>{remark.auditComment}</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </Card>
            ))
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>

      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false);
        }}
        bodyStyle={{ height: '50vh', borderRadius: '8px 8px 0 0' }}
        afterShow={actVersion?.materialType === 'IMAGE' ? () => {} : initPlay}
        afterClose={
          actVersion?.materialType === 'IMAGE'
            ? () => {}
            : () => {
                setInitSuccess(false);
                _player?.destroy(true);
              }
        }
        destroyOnClose
      >
        <div className={styles.popupHeader}>{actIndex === 0 ? '当前版本' : `素材版本${actIndex}`}</div>
        <div className={styles.popupContent}>
          {!initSuccess && actVersion?.materialType === 'VIDEO' && (
            <Skeleton animated style={{ '--height': '189px' }} />
          )}
          {actVersion?.materialType === 'IMAGE' ? (
            <div className="tw-text-center">
              <Image src={actVersion?.fileUrl} className="tw-h-189px" fit="contain" />
            </div>
          ) : (
            <div id="playHisBox" className={classNames('tw-w-full', 'tw-h-189px')}></div>
          )}

          <div className="tw-h-140px tw-my-10px tw-overflow-auto tw-bg-[#F7FAFA]">
            {actVersion?.remarkList.map((remark, i) => (
              <div key={remark.submitUser + i}>
                {remark.auditComment ? (
                  <div className="tw-text-[#626A6A] tw-text-sm tw-p-5px">
                    <div>
                      {actVersion?.materialType === 'VIDEO' && remark.pointTime} {remark.auditComment}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </>
  );
};

export default React.memo(History);
