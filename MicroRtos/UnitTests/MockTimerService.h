namespace HardwareAbstraction
{
	class MockTimerService : public ITimerService
	{
	public:
		unsigned int Tick;
		unsigned int TicksPerSecond;
		unsigned int GetTick(void);
		unsigned int GetTicksPerSecond();
	};
}