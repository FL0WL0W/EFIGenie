namespace EngineManagement
{
	class MockIntakeAirTemperatureService : public IIntakeAirTemperatureService
	{
	public:
		MOCK_METHOD0(ReadIat, void());
	};
}