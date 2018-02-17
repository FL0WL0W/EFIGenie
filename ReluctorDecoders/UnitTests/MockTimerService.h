namespace HardwareAbstraction
{
	class MockTimerService : public ITimerService
	{
	public:
		unsigned int Tick;
		MOCK_METHOD1(ScheduleCallBack, void(unsigned int tick));
		MOCK_METHOD0(GetTick, unsigned int());
		MOCK_METHOD0(GetTicksPerSecond, unsigned int());
	};
}