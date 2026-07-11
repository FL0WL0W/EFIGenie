#include "CommunicationHandlers/CommunicationHandler_OBD2PID.h"
#include "Operations/Operation.h"

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <array>
#include <cstring>

#include "MockCommunicationService.h"

namespace EFIGenie
{
	class BytePIDOperation : public OperationArchitecture::Operation<uint8_t>
	{
	public:
		explicit BytePIDOperation(uint8_t value) : _value(value) {}
		uint8_t Execute() override { return _value; }

	private:
		uint8_t _value;
	};

	class WordPIDOperation : public OperationArchitecture::Operation<uint16_t>
	{
	public:
		uint16_t Execute() override { return 0x1234; }
	};

	class ByteArrayPIDOperation : public OperationArchitecture::Operation<std::array<uint8_t, 4>>
	{
	public:
		std::array<uint8_t, 4> Execute() override { return {{ 0x12, 0x34, 0x56, 0x78 }}; }
	};

	TEST(CommunicationHandler_OBD2PIDTests, RegisteredPIDReturnsOperationPayload)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation operation(0x7f);
		ASSERT_TRUE(service.RegisterPID(0x04, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x04, 0x7f };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x04 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, ScalarPayloadUsesNetworkByteOrder)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		WordPIDOperation operation;
		ASSERT_TRUE(service.RegisterPID(0x0c, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 4))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x0c, 0x12, 0x34 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x0c };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, OtherPayloadPreservesOperationByteOrder)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		ByteArrayPIDOperation operation;
		ASSERT_TRUE(service.RegisterPID(0x0d, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x0d, 0x12, 0x34, 0x56, 0x78 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x0d };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, Service22ReturnsRegisteredDID)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation operation(0x7f);
		ASSERT_TRUE(service.RegisterPID(0xf190, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 4))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x62, 0xf1, 0x90, 0x7f };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x22, 0xf1, 0x90 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, Service22SupportsMultipleDIDs)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation byteOperation(0x7f);
		WordPIDOperation wordOperation;
		ASSERT_TRUE(service.RegisterPID(0xf190, &byteOperation));
		ASSERT_TRUE(service.RegisterPID(0x1234, &wordOperation));

		EXPECT_CALL(communicationService, Send(testing::_, 8))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x62, 0xf1, 0x90, 0x7f, 0x12, 0x34, 0x12, 0x34 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x22, 0xf1, 0x90, 0x12, 0x34 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, LowIdentifierSupportsService1AndService22)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation operation(0x7f);
		ASSERT_TRUE(service.RegisterPID(0x0004, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 4))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x62, 0x00, 0x04, 0x7f };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x22, 0x00, 0x04 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, Service22RejectsUnknownAndMalformedDIDs)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x7f, 0x22, 0x31 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		const uint8_t unknown[] = { 0x22, 0xf1, 0x90 };
		EXPECT_EQ(communicationService.Receive(unknown, sizeof(unknown)), sizeof(unknown));

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x7f, 0x22, 0x13 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		const uint8_t malformed[] = { 0x22, 0xf1 };
		EXPECT_EQ(communicationService.Receive(malformed, sizeof(malformed)), sizeof(malformed));
	}

	TEST(CommunicationHandler_OBD2PIDTests, UnsupportedService1PIDsAreConsumed)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		const uint8_t unsupportedService[] = { 0x02, 0x04 };
		const uint8_t unsupportedPID[] = { 0x01, 0x05 };
		const uint8_t incompleteService1[] = { 0x01 };

		EXPECT_CALL(communicationService, Send(testing::_, testing::_)).Times(0);
		EXPECT_EQ(communicationService.Receive(unsupportedService, sizeof(unsupportedService)), 0u);
		EXPECT_EQ(communicationService.Receive(unsupportedPID, sizeof(unsupportedPID)), sizeof(unsupportedPID));
		EXPECT_EQ(communicationService.Receive(incompleteService1, sizeof(incompleteService1)), sizeof(incompleteService1));
	}

	TEST(CommunicationHandler_OBD2PIDTests, RejectsOperationsWithParameters)
	{
		class ParameterOperation : public OperationArchitecture::Operation<uint8_t, uint8_t>
		{
			uint8_t Execute(uint8_t value) override { return value; }
		} operation;

		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		EXPECT_FALSE(service.RegisterPID(0x04, &operation));
	}

	TEST(CommunicationHandler_OBD2PIDTests, SupportedPIDRequestReturnsBitmap)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation operation(0);
		ASSERT_TRUE(service.RegisterPID(0x01, &operation));
		ASSERT_TRUE(service.RegisterPID(0x08, &operation));
		ASSERT_TRUE(service.RegisterPID(0x1f, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x00, 0x81, 0x00, 0x00, 0x02 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x00 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, SupportedPIDBitmapAdvertisesNextPage)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PID service(&communicationService);
		BytePIDOperation operation(0);
		ASSERT_TRUE(service.RegisterPID(0x21, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x00, 0x00, 0x00, 0x00, 0x01 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x00 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x20, 0x80, 0x00, 0x00, 0x00 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t nextPageRequest[] = { 0x01, 0x20 };
		EXPECT_EQ(communicationService.Receive(nextPageRequest, sizeof(nextPageRequest)), sizeof(nextPageRequest));
	}
}
