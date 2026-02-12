type DisclaimerBannerProps = {
  text: string;
};

const DisclaimerBanner = ({ text }: DisclaimerBannerProps) => {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
      {text}
    </div>
  );
};

export default DisclaimerBanner;
