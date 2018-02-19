namespace EngineManagement
{
	class MockEngineCoolantTemperatureService : public IEngineCoolantTemperatureService
	{
	public:
		MOCK_METHOD0(ReadEct void());
	};
}