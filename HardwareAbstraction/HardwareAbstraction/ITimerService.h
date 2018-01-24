namespace HardwareAbstraction
{
	class ITimerService
	{
	public:
		virtual void SetCallBack(std::function<void(unsigned int)> callBack) = 0;
		virtual void ScheduleCallBack(unsigned int tick) = 0;
		virtual unsigned int GetTick(void) = 0;
		virtual unsigned int GetTicksPerSecond() = 0;
	};
}