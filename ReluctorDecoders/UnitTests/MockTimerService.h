namespace HardwareAbstraction
{
	class MockTimerService : public ITimerService
	{
	public:
		std::function<void(unsigned int)> CallBack;
		unsigned int Tick;
		unsigned int CallBackTick;
		unsigned int TicksPerSecond;
		void SetCallBack(std::function<void(unsigned int)> callBack);
		void ScheduleCallBack(unsigned int tick);
		unsigned int GetTick(void);
		unsigned int GetTicksPerSecond();
	};
}