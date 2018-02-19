namespace EngineManagement
{
	class MockFuelPumpService : public IFuelPumpService
	{
	public:
		MOCK_METHOD0(Prime, void());
		MOCK_METHOD0(On, void());
		MOCK_METHOD0(Off, void());
		MOCK_METHOD0(Tick, void());
	};
}